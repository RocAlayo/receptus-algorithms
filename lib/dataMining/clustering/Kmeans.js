"use strict";

var algInterface = require("receptus").interfaces.Algorithm,
    _ = require("lodash"),
    euclidianDistance = require("./similarityWithinRegisters/euclideanDistance"),
    randomCentroids = require("./positionOfCentroids/randomCentroids"),
    sse = require("./Evaluation/internalCriteria/sse");

function Kmeans() {
  this.params = {};
  this.defaultParams = {
    centroids: 2,
    similarity: euclidianDistance,
    convergenceIterations: 2,
    internalEvaluation: sse
  };
  this.configured = false;
}

Kmeans.prototype = Object.create(algInterface);

Kmeans.prototype.setConfig = function configFunc(params) {
  this.params = _.defaults(params,this.defaultParams);

  if(!_.isArray(this.params.centroids) && !_.isNumber(this.params.centroids)) {
    throw new Error("'centroids' property needs to be an array or a number");
  } else if (_.isArray(this.params.centroids) && !this.params.centroids.length) {
    throw new Error("'centroids' property can't be an empty array");
  }

  if (!_.isFunction(this.params.similarity)) {
    throw new Error("'similarity' property needs to be a function");
  }

  if(!_.isNumber(this.params.convergenceIterations)) {
    throw new Error("'convergenceIterations' property needs to be an integer number");
  } else if (this.params.convergenceIterations <= 0) {
    throw new Error("'convergenceIterations' property needs to be more than zero");
  }

  if(_.isFunction(this.params.internalEvaluation)) {
    this.params.internalEvaluation = [this.params.internalEvaluation];
  } else if(!_.isArray(this.params.internalEvaluation)) {
    throw new Error("'internalEvaluation' property needs to be an array or a function.");
  }

  this.configured = true;
};

Kmeans.prototype.getConfig = function getConfigFunc() {
  return this.params;
};

Kmeans.prototype.execute = function executeFunc(data) {
  var centroidsAct,
      dataCentroids = [],
      centroids = this.params.centroids,
      convergence = this.params.convergenceIterations;

  if (!this.configured) {
    throw new Error("Execute methods needs to be configured first via setConfig method");
  } else if (!_.isArray(data)) {
    throw new Error("First argument needs to be an array");
  } else if (!data.length) {
    throw new Error("First argument can't be an empty array");
  } else if (_.isArray(centroids) && data[0].length !== centroids[0].length) {
    throw new Error("Number of attributes of first argument don't match with number of attributes of centroids");
  }

  if(_.isNumber(centroids)) {
    centroids = randomCentroids(data, centroids);
  }

  while(convergence > 0) {
    dataCentroids = assignCentroid(data, dataCentroids, centroids, this.params.similarity);
    centroidsAct = recalculateCentroids(data, dataCentroids, centroids.length);
    if (equalCentroids(centroids, centroidsAct)) {
      convergence--;
    } else {
      convergence = this.params.convergenceIterations;
    }
    centroids = centroidsAct;
  }

  return {
    centroids: centroids,
    centroidOfRegisters: dataCentroids,
    internalEvaluation: this.params.internalEvaluation.map(function (func) {
      return func(data, dataCentroids, centroids);
    })
  };
};

/**
 * Assign every register to a centroid
 *
 * @param data
 * @param dataCentroids
 * @param centroids
 * @param funcSimilarity
 * @returns {*}
 */
function assignCentroid(data, dataCentroids, centroids, funcSimilarity) {
  var i, j,
      similarities = [];

  //similarities between every register and every centroid
  for(i = 0; i < data.length; i++) {
    similarities[i] = [];
    for(j = 0; j < centroids.length; j++) {
      similarities[i][j] = funcSimilarity(centroids[j], data[i]);
    }
  }

  //search between every similarity to return the closest one
  for(i = 0; i < data.length; i++) {
    dataCentroids[i] = similarities[i].reduce(selectClosestCentroid, 0);
  }

  return dataCentroids;
}

function selectClosestCentroid(indexAnt, act, index, array) {
  return array[indexAnt] < act ? indexAnt : index;
}

/**
 * Recalculate every centroid to reflect de possibles changes in the assignation
 * of every register.
 *
 * @param data
 * @param dataCentroids
 * @param num
 * @returns {Array}
 */
function recalculateCentroids(data, dataCentroids, num) {
  var centroids = [],
      numRegCentroids = [],
      i, j;

  //initialize arrays
  for(i = 0; i < num; i++) {
    centroids[i] = [];
    numRegCentroids[i] = 0;
    for(j = 0; j < data[0].length; j++) {
      centroids[i][j] = 0;
    }
  }

  //calculate number of registers of every centroid
  dataCentroids.forEach(function (centroidNum) {
    numRegCentroids[centroidNum]++;
  });

  // adding all rows attributes to the centroids where they belong
  for(i = 0; i < data.length; i++) {
    for(j = 0; j < data[i].length; j++) {
      centroids[dataCentroids[i]][j] += data[i][j];
    }
  }

  // dividing all attributes of the centroids for the number of rows
  // to get the average attributes of each centroid
  for(i = 0; i < num; i++) {
    for(j = 0; j < data[0].length; j++) {
      centroids[i][j] /= numRegCentroids[i];
    }
  }

  return centroids;
}

/**
 * Compare two centroids with a tolerance of 0.01.
 * Return true if they are equal, and false if not.
 *
 * @param centroids1
 * @param centroids2
 * @returns {boolean}
 */
function equalCentroids(centroids1, centroids2) {
  var i, j, res = true;
  for(i = 0; i < centroids1.length; i++) {
    for(j = 0; j < centroids1[i].length; j++) {
      // add a tolerance of 0.01 for the decimals
      res = res && (centroids1[i][j] - centroids2[i][j]) < 0.00001;
    }
  }
  return res;
}

module.exports = Kmeans;
