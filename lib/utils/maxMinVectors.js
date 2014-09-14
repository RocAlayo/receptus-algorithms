"use strict";

var _ = require("lodash");

module.exports = function maxMinVectors(matrix) {
  var ret = {
        max: _.clone(matrix[0]),
        min: _.clone(matrix[0])
      },
    i, j,
    attribute;

  for(i = 0; i < matrix.length; i++) {
    for(j = 0; j < matrix[i].length; j++) {
      attribute = matrix[i][j];

      if(_.isNull(attribute) || _.isNaN(attribute || _.isString(attribute))) { continue; }

      //max value
      if(attribute > ret.max[j]) {
        ret.max[j] = attribute;
      }

      //min value
      if(attribute < ret.min[j]) {
        ret.min[j] = attribute;
      }
    }
  }

  return ret;
};
