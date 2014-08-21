"use strict";

module.exports = function normalizeMatrix(matrix, minVector, maxVector) {


  return matrix.map(function (register) {
    return register.map(function (attribute, index) {
      var ret =  (attribute - minVector[index]) / (maxVector[index] - minVector[index]);
      return ret;
    });
  });
};
