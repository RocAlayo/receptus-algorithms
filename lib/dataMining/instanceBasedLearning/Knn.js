"use strict";

var algInterface = require("receptus").interfaces.Algorithm,
    _ = require("lodash"),
    euclideanDistance = require("../clustering/similarityWithinRegisters/euclideanDistance");

function Knn() {
  this.params = {};
  this.defaultParams = {
    k: 10,
    similarity: euclideanDistance,
    predict: {
      register: [],
      attributes: [],
      excludeAttributes: []
    }
  };
  this.configured = false;
}

Knn.prototype = Object.create(algInterface);

Knn.prototype.setConfig = function configFunc(params) {
  this.params = _.defaults(params,this.defaultParams);

  //TODO: verify params

  this.configured = true;
};

Knn.prototype.getConfig = function getConfigFunc() {
  return this.params;
};

Knn.prototype.execute = function executeFunc(data) {
  var that = this,
      distances,
      k = this.params.k,
      indexesDistances,
      register = _.cloneDeep(this.params.predict.register),
      result = {},
      maxDist;

  if(!_.isArray(data) || data.length === 0) {
    throw new Error("The parameter needs to be a matrix");
  }

  if(_.isArray(data[0]) || data[0].length === 0 ) {
    throw new Error("The parameter needs to be a matrix");
  }

  if(data[0].length !== register) {
    throw new Error("Register to predict and data need to have the same attributes");
  }

  //Calculate distances within every register and the register to classify
  distances = data.map(function (reg) {
    return compareRegisters(that, reg, register);
  });

  //Get k nearest register
  indexesDistances = Object.keys(distances);
  _.sortBy(indexesDistances, function (index) {
    return distances[index];
  });
  maxDist = distances[indexesDistances[indexesDistances.length - 1]];
  indexesDistances = indexesDistances.splice(0, k);

  that.params.predict.attributes.forEach(function (attribIndex) {
    var res = indexesDistances.reduce(function (prevVal, index) {
      return prevVal + (data[index][attribIndex] / Math.pow(distances[index][attribIndex] / maxDist, 2));
    }, 0);

    result[attribIndex] = res / k;
  });

  return result;
};

function compareRegisters(obj, reg1, reg2) {
  var register1 = _.cloneDeep(reg1),
      register2 = _.cloneDeep(reg2);

  // TODO: discard all the attributes that can't or won't be compared.

  return obj.params.similarity(register1, register2, obj.params.predict.excludedAttributes);
}

module.exports = Knn;
