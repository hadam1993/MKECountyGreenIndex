const _ = require('lodash');
const vegData = require("../_data/veg-data.json");

module.exports = ({ censusTracts, fipsTractParse, writeFile }) => {
  const dtos = _.chain(vegData)
    .map((d) => {
      const { state_code, county_code, tract_code, blockgroup: blockgroup1 } = d;
      const state = _.last(state_code.match(/^State([0-9]+)$/));
      const county = _.last(county_code.match(/^County([0-9]+)$/));
      const tract = _.last(tract_code.match(/^tract([0-9]+)$/));
      const blockgroup = _.last(blockgroup1.match(/^blockgroup([0-9]+)$/));
      const fipsTract = fipsTractParse({ state, county, tract, blockgroup });
      return {
        ...d,
        state,
        county,
        tract,
        blockgroup,
        fipsTract: fipsTract
      };
    })
    .groupBy('fipsTract')
    .value();

  const parsed = _.map(censusTracts.features, ({ geometry, properties }) => {
    const fipsTract = properties.FIPS_BLKGR || properties.FIPS_TRACT;
    const vegetation = _.get(dtos, fipsTract, []);

    const { state, county, tract } = _.first(vegetation);

    return {
      id: _.uniqueId(),
      fipsTract,
      state,
      county,
      tract,
      area: properties.SHAPESTAre,
      length: properties.SHAPESTLen,
      averageGreenIndex: _.meanBy(vegetation, ({ green_index }) => parseFloat(green_index)),
      vegetation: _.map(vegetation, ({ image_id, lat, lon, green_index }) => ({
        imageId: image_id,
        lat,
        lng: lon,
        greenIndex: parseFloat(green_index)
      })),
      coordinates: _.map(geometry.coordinates[0], ([ lng, lat ]) => ([lat, lng])),
    }
  });

  const allGreenIndexes = _.map(_.flatten(_.map(parsed, 'vegetation')), 'greenIndex');

  const min = _.min(allGreenIndexes);
  const max = _.max(allGreenIndexes);

  console.log({ min, max });

  _.each(parsed, (data) => {
    const { averageGreenIndex } = data;
    data.adjustedAverage = (averageGreenIndex - min) / (max - min);
  });

  writeFile({
    min,
    max,
    values: parsed
  });
};
