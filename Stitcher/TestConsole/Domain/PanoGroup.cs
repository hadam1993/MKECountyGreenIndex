using System.Collections.Generic;

namespace TestConsole.Domain
{
    public class PanoGroup
    {
        public string PlaceId { get;set; }
        public List<PanoFile> Files { get; set; }
    }
}