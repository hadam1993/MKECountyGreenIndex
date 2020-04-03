using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using MoreLinq;
using Newtonsoft.Json;
using TestConsole.Domain;

namespace TestConsole
{
    internal class Program
    {
        public static void Main(string[] args)
        {
            var applicationFolder = Path.GetDirectoryName(Assembly.GetEntryAssembly().Location);
            var configFile = Path.Combine(applicationFolder, "config.json");
            var config = JsonConvert.DeserializeObject<Config>(File.ReadAllText(configFile));

            foreach (var directory in config.InputFolders)
            {
                var groups = GetPanoGroups(directory);

                Parallel.ForEach(
                    groups,
                    new ParallelOptions { MaxDegreeOfParallelism = 25 },
                    panoGroup =>
                    {
                        try
                        {
                            var outputFilepath = Path.Combine(config.OutputFolder + panoGroup.PlaceId + ".jpg");

                            if (File.Exists(outputFilepath))
                            {
                                Console.WriteLine($"Nothing to do for place: {panoGroup.PlaceId}");
                                return;
                            }

                            Console.WriteLine($"Processing {panoGroup.Files.Count} Files for {panoGroup.PlaceId}");

                            var images = panoGroup.Files
                                .Select(f => Image.FromFile(f.Path))
                                .ToList();

                            var totalWidth = images.Sum(i => i.Width);

                            using (var combinedBitmap = new Bitmap(totalWidth, images.First().Height))
                            {
                                using (var combinedGraphics = Graphics.FromImage(combinedBitmap))
                                {
                                    var drawingPosition = 0;
                                    foreach (var bitmap in images)
                                    {
                                        combinedGraphics.DrawImage(bitmap, new Point(drawingPosition, 0));
                                        drawingPosition += bitmap.Width;
                                        bitmap.Dispose();
                                    }

                                    combinedBitmap.Save(outputFilepath, ImageFormat.Jpeg);
                                }
                            }

                            Console.WriteLine(panoGroup.PlaceId);
                        }
                        catch (Exception e)
                        {
                            Console.WriteLine(e);
                        }
                    }
                );
            }
        }

        public static List<PanoGroup> GetPanoGroups(string inputDir)
        {
            const string pattern = @"^[\S]+PAN@([\S]+)Heading@([0-9]+)Pitch@([0-9]+)$";

            var files = Directory.GetFiles(inputDir, "*.jpg", SearchOption.AllDirectories).ToList();

            return files
                .Select(f =>
                {
                    var filename = Path.GetFileNameWithoutExtension(f);
                    var placeId = Regex.Match(filename, pattern).Groups[1].Value;
                    var heading = Regex.Match(filename, pattern).Groups[2].Value;
                    var pitch = Regex.Match(filename, pattern).Groups[3].Value;

                    return new PanoFile
                    {
                        Path = f,
                        PlaceId = placeId,
                        Filename = filename,
                        Heading = int.Parse(heading),
                        Pitch = int.Parse(pitch)
                    };
                })
                .GroupBy(f => f.PlaceId)
                .Select(g => new PanoGroup
                {
                    PlaceId = g.Key,
                    Files = g.DistinctBy(f => f.Heading).OrderBy(f => f.Heading).ToList()
                })
                .ToList();
        }
    }
}