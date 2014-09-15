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
      excludedAttributes: []
    }
  };
  this.configured = false;
}

Knn.prototype = Object.create(algInterface);

Knn.prototype.setConfig = function configFunc(params) {
  this.params = _.defaults(params,this.defaultParams);
  this.params.predict = _.defaults(params.predict,this.defaultParams.predict);

  if(!_.isNumber(this.params.k)) {
    throw new Error("'k' needs to be an integer");
  }

  if (!_.isFunction(this.params.similarity)) {
    throw new Error("'similarity' property needs to be a function");
  }

  if (!_.isPlainObject(this.params.predict)) {
    throw new Error("'predict' property needs to be a plain object");
  }

  if (!_.isArray(this.params.predict.register)) {
    throw new Error("'register' property of 'predict' needs to be an array");
  }

  if (!_.isNumber(this.params.predict.attributes) && !_.isArray(this.params.predict.attributes)) {
    throw new Error("'attributes' property of 'predict' needs to be a number or an array");
  }

  if (!_.isNumber(this.params.predict.excludedAttributes) && !_.isArray(this.params.predict.excludedAttributes)) {
    throw new Error("'excludedAttributes' property of 'predict' needs to be a number or an array");
  }

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
      register,
      result = {},
      maxDist;

  if (!this.configured) {
    throw new Error("Execute methods needs to be configured first via setConfig method");
  } else if (!_.isArray(data)) {
    throw new Error("First argument needs to be an array");
  } else if (!data.length) {
    throw new Error("First argument can't be an empty array");
  } else if (data[0].length !== this.params.predict.register.length) {
    throw new Error("Registers of argument need to have same number of properties than 'params.predict.register'");
  }

  if(_.isNumber(this.params.predict.attributes)) {
    this.params.predict.attributes = [this.params.predict.attributes];
  }

  if(_.isNumber(this.params.predict.excludedAttributes)) {
    this.params.predict.excludedAttributes = [this.params.predict.excludedAttributes];
  }

  this.params.predict.excludedAttributes = _.union(this.params.predict.excludedAttributes, this.params.predict.attributes);

  register = _.cloneDeep(this.params.predict.register);

  //Calculate distances within every register and the register to classify
  distances = data.map(function (reg) {
    return that.params.similarity(reg, register, that.params.predict.excludedAttributes);
  });

  //Get k nearest register
  indexesDistances = Object.keys(distances);
  indexesDistances = _.sortBy(indexesDistances, function (index) {
    return distances[index];
  });
  maxDist = distances[indexesDistances[indexesDistances.length - 1]];

  if(k < data.length) {
    indexesDistances = indexesDistances.splice(0, k);
  }

  that.params.predict.attributes.forEach(function (attrIndex) {
    var res = indexesDistances.reduce(function (prevVal, index) {
      var normalizedDistance = (maxDist === 0 ? 0 : (distances[index] / maxDist));

      return prevVal + (data[index][attrIndex] * (1 - normalizedDistance));
    }, 0);

    if(k < data.length) {
      result[attrIndex] = res / k;
    } else {
      result[attrIndex] = res / data.length;
    }
  });

  return result;
};

module.exports = Knn;
