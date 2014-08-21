"use strict";

var _ = require("lodash");

function randomCentroids(data, num) {
  var numRegisters = data.length,
      clusters = [],
      clonedData = _.cloneDeep(data),
      i, r;

  if (num > numRegisters) {
      throw new Error("Data is too small for the number of clusters");
  }

  for(i = 0; i < num; i++) {
    r = randomNum(0, numRegisters - 1);
    clusters[i] = _.cloneDeep(clonedData[r]);
    clonedData.splice(r, 1);
    numRegisters -= 1;
  }

  return clusters;
}

function randomNum(min, max) {
  return _.random(min,max);
}

module.exports = randomCentroids;
