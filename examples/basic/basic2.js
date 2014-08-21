/**
 * Created by roc on 30/05/14.
 */
"use strict";

var Receptus = require("receptus"),
  receptusAlgorithms = require("../../lib"),
  receptus = new Receptus({
    path: receptusAlgorithms()
  });

receptus.addDependency("numClusters", 5);

receptus.saveStep("kmeans", function ($data, randomCentroids, Kmeans, euclideanDistance, numClusters) {
  var kmeans = new Kmeans(),
    result;

  kmeans.setConfig({
    centroids: randomCentroids($data, numClusters),
    similarity: euclideanDistance,
    convergenceIterations: 20
  });

  result =  kmeans.execute($data);

  return {
    centroids: result.centroids,
    data: $data,
    dataCentroids: result.centroidOfRegisters
  };
});

receptus.step(function (csvInputData) {
  csvInputData.setConfig({
    "path": __dirname + "/data.csv",
    "class-row": 0
  });

  return csvInputData.getContent();
})
.step("kmeans")
.step(function ($data) {
  var numInstances = [0,0,0,0,0],
      numZeros;

  $data.dataCentroids.forEach(function (centroid) {
    numInstances[centroid]++;
  });

  console.log(numInstances);
  numZeros = numInstances.filter(function (val) {
    return val === 0;
  }).length;

  receptus.addDependency("numClusters", 5 - numZeros);

  return $data.data;
})
.step("kmeans")
.step(function ($data) {
  var numInstances = [0,0,0];

  $data.dataCentroids.forEach(function (centroid) {
    numInstances[centroid]++;
  });

  console.log(numInstances);
})
.error(function ($error) {
  console.log($error.stack);
});