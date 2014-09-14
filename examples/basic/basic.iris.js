/**
 * Created by roc on 30/05/14.
 */
"use strict";

var Receptus = require("receptus"),
    receptusAlgorithms = require("../../lib"),
    receptus = new Receptus({
      path: receptusAlgorithms()
    }),
    vectors;

receptus.addDependency("numClusters", 3);

receptus.saveStep("kmeans", function ($data, Kmeans, manhattanDistance, euclideanDistance, numClusters) {
  var kmeans = new Kmeans(),
    result;

  kmeans.setConfig({
    centroids: numClusters,
    similarity: manhattanDistance,
    convergenceIterations: 5
  });

  result = kmeans.execute($data);

  return {
    centroids: result.centroids,
    data: $data,
    dataCentroids: result.centroidOfRegisters,
    sse: result.internalEvaluation[0]
  };
});

receptus.step(function (csvInputData) {
  csvInputData.setConfig({
    "path": __dirname + "/iris.data.csv",
    "header": true,
    "excludedColumns": 4
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
.step("kmeans")
.step(function ($data, denormalizeMatrix) {
  var numInstances = [0,0,0];

  $data.dataCentroids.forEach(function (centroid) {
    numInstances[centroid]++;
  });

  console.log($data.sse);
  console.log(numInstances);
  console.log(denormalizeMatrix($data.centroids, vectors.min, vectors.max));
})
.error(function ($error) {
  console.log($error.stack);
});
