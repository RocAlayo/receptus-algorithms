/**
 * Created by roc on 30/05/14.
 */
"use strict";

var Receptus = require("receptus"),
    receptusAlgorithms = require("../../lib"),
    receptus = new Receptus();

receptus.loadDependencies(receptusAlgorithms());

receptus.saveStep("kmeans", function ($data, randomCentroids, kmeans, euclideanDistance) {
  var result;

  kmeans.config({
    centroids: 5,
    similarity: euclideanDistance,
    convergenceIterations: 10
  });

  result =  kmeans.execute($data);

  return {
    centroids: result.centroids,
    data: $data,
    dataCentroids: result.centroidOfRegisters
  };
});

receptus.step(function (csvInputData) {
  csvInputData.config({
    "path": __dirname + "/data.csv",
    "class-row": 1
  });

  return csvInputData.getContent();
})
.step(true, ["kmeans","kmeans", "kmeans"])
.step(function ($data) {
  var numInstances;

  $data.forEach(function (result) {
    numInstances = [0,0,0,0,0];
    result.data.forEach(function (row) {
      numInstances[row.centroid]++;
    });
    console.log(numInstances);
  });
}).error(function ($error) {
  console.log($error.stack);
});

