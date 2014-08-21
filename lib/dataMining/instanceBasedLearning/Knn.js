"use strict";

var algInterface = require("receptus").interfaces.Algorithm,
    _ = require("lodash"),
    euclidianDistance = require("../clustering/similarityWithinRegisters/euclideanDistance");

function Knn() {
  this.params = {};
  this.defaultParams = {
    k: 10,
    similarity: euclidianDistance,
    predict: {
      register: [],
      attributes: []
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
      register = _.cloneDeep(this.params.predict.register);

  if(!_.isArray(data) || data.length === 0) {
    throw new Error("The parameter needs to be a matrix");
  }

  if(_.isArray(data[0]) || data[0].length === 0 ) {
    throw new Error("The parameter needs to be a matrix");
  }

  if(data[0].length !== register) {
    throw new Error("Register to predict and data need to have the same attributes");
  }

  distances = data.map(function (reg) {
    return compareRegisters(that, reg, register);
  });

  indexesDistances = Object.keys(distances);

  _.sortBy(indexesDistances, function (index) {
    return distances[index];
  });

  indexesDistances = indexesDistances.splice(0, k);

  that.params.predict.attributes.forEach(function (attribIndex) {
    var sum = indexesDistances.reduce(function (prevVal, index) {

      //TODO: i don't know if this formula is good enough
      return prevVal + (distances[index][attribIndex] * data[index][attribIndex]);
    }, 0);
    register[attribIndex] = sum / k;
  });

  return register;
};

function compareRegisters(obj, reg1, reg2) {
  var register1 = _.cloneDeep(reg1),
      register2 = _.cloneDeep(reg2);

  // TODO: discard all the attributes that can't or won't be compared.

  return obj.params.similarity(register1, register2);
}

module.exports = Knn;
