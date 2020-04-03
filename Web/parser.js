const _ = require('lodash');
const fs = require('fs-extra');
const parser = require('./parsers/parser');

parser({
  censusTracts: require("./_data/Census_Tracts.json"),
  fipsTractParse: ({ state, county, tract }) => `${state}${county}${tract}`,
  writeFile: (parsed) => {
    fs.writeJsonSync('./_data/exampleTract.json', _.take(parsed, 5), { spaces: 2 });
    fs.writeJsonSync('./public/data/parsedTract.json', parsed);
    fs.writeJsonSync('./src/data/parsedTract.json', parsed);
  }
});

parser({
  censusTracts: require("./_data/Census_Tracts_Block.json"),
  fipsTractParse: ({ state, county, tract, blockgroup }) => `${state}${county}${tract}${blockgroup}`,
  writeFile: (parsed) => {
    fs.writeJsonSync('./_data/exampleBlock.json', _.take(parsed, 5), { spaces: 2 });
    fs.writeJsonSync('./public/data/parsedBlock.json', parsed);
    fs.writeJsonSync('./src/data/parsedBlock.json', parsed);
  }
});

parser({
  censusTracts: require("./_data/Census_Tracts.json"),
  fipsTractParse: ({ state, county, tract }) => `${state}${county}${tract}`,
  writeFile: (parsed) => {
    const allVegetation = _.flatten(_.map(parsed, 'vegetation'));
    fs.writeJsonSync('./public/data/vegetation.json', allVegetation);
    fs.writeJsonSync('./src/data/vegetation.json', allVegetation);
  }
});
