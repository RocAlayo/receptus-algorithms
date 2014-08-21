"use strict";

var OutputData = require("receptus").OutputData,
    jsonFormatter;

function formatter(data, dataCentroids, centroids) {
  return {
    data: data,
    dataCentroids: dataCentroids,
    centroids: centroids
  };
}

jsonFormatter = new OutputData(formatter);

jsonFormatter.name = "jsonOutputData";

module.exports = jsonFormatter;