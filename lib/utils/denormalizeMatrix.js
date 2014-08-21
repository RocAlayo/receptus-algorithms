"use strict";

module.exports = function denormalizeMatrix(matrix, minVector, maxVector) {

  return matrix.map(function (register) {
    return register.map(function (attribute, index) {
      return (attribute * (maxVector[index] - minVector[index])) + minVector[index];
    });
  });
};
