"use strict";

var _ = require("lodash"),
    math = require("mathjs")();

function euclideanDistance(register1, register2, excludedAttributesIndexes) {
  var res = 0,
      i;

  if(!_.isArray(excludedAttributesIndexes)) {
    excludedAttributesIndexes = [];
  }

  if(arguments.length < 2) {
    throw new Error("Needs 2 arguments to work properly");
  }

  if(!_.isArray(register1) || !_.isArray(register2)) {
    throw new Error("Both arguments need to be arrays");
  }

  if(register1.length !== register2.length) {
    throw new Error("Both arguments need to be same size arrays");
  }


  if(_.isArray(excludedAttributesIndexes) && excludedAttributesIndexes.length > 0) {
    for(i = 0; i < register1.length; i++) {
      if(excludedAttributesIndexes.indexOf(i) === -1) {
        res += math.square(register1[i] - register2[i]);
      }
    }
  } else {
    for(i = 0; i < register1.length; i++) {
      res += math.square(register1[i] - register2[i]);
    }
  }


  return math.sqrt(res);
}

module.exports = euclideanDistance;
