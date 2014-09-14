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
    "path": __dirname + "/wholesale.data.csv",
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
.step(function ($data, randomCentroids, kmeans, euclideanDistance, manhattanDistance) {
  var result;

  kmeans.setConfig({
    centroids: randomCentroids($data, 2),
    similarity: manhattanDistance,
    convergenceIterations: 10
  });

  result =  kmeans.execute($data);

  return {
    centroids: result.centroids,
    rawData: $data,
    dataCentroids: result.centroidOfRegisters,
    sse: result.internalEvaluation[0]
  };
}).step(function ($dataCentroids, $centroids, denormalizeMatrix, $sse) {
  var numInstances = [0,0];
  $dataCentroids.forEach(function (centroid) {
    numInstances[centroid]++;
  });

  console.log($sse);
  console.log(numInstances);
  console.log(denormalizeMatrix($centroids, vectors.min, vectors.max));
})
.error(function ($error) {
  console.log($error.stack);
});
