"use strict";

var Receptus = require("receptus"),
    receptusAlgorithms = require("../../lib"),
    receptus = new Receptus({
      path: receptusAlgorithms()
    }),
    vectors;

receptus
.step(function (csvInputData) {
  csvInputData.setConfig({
    "path": __dirname + "/data.csv",
    "header": true
  });

  return csvInputData.getContent();
})
.step(function ($data, maxMinVectors, normalizeMatrix) {
  $data = $data.map(function (register) {
    return register.map(parseFloat);
  });

  vectors = maxMinVectors($data);

  return normalizeMatrix($data, vectors.min, vectors.max);
})
.step(function ($data, randomCentroids, kmeans, euclideanDistance) {
  var result;

  kmeans.setConfig({
    centroids: randomCentroids($data, 3),
    similarity: euclideanDistance,
    convergenceIterations: 5
  });

  result =  kmeans.execute($data);

  return {
    centroids: result.centroids,
    rawData: $data,
    dataCentroids: result.centroidOfRegisters
  };
}).step(function ($dataCentroids, $centroids, denormalizeMatrix) {
  var numInstances = [0,0,0];
  $dataCentroids.forEach(function (centroid) {
    numInstances[centroid]++;
  });
  console.log(numInstances);
  console.log(denormalizeMatrix($centroids, vectors.min, vectors.max));
})
.error(function ($error) {
  console.log($error.stack);
});
