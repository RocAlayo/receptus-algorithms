"use strict";

var euclidianDistance = require("../../similarityWithinRegisters/euclideanDistance");

/**
 * Sum of Squared Error
 */
module.exports = function sse(registers, registersClusters, centroids) {
  var n = registers.length,
      numClusters = centroids.length,
      nk = [],
      sk,
      result = 0,
      i;

  for(i = 0; i < numClusters; i++) {
    nk[i] = 0;
  }

  //Calculate N_k with is the number of register for every cluster
  registersClusters.forEach(function (registerCluster) {
    nk[registerCluster]++;
  });

  sk = nk.map(function(currNk, index) {
    var currSk = plusModules(index, registersClusters, registers);

    currSk /= Math.pow(currNk, 2);
    return currSk;
  });

  result = nk.reduce(function (prevVal, currNk, index) {
    return prevVal + (currNk * sk[index]);
  }, result);

  result /= 2;

  return result;
};

function plusModules(k, registersK, allRegisters) {
  var registersIndexes = [],
      distances;

  registersK.forEach(function (indexCluster, index) {
    if(indexCluster === k) {
      registersIndexes.push(index);
    }
  });

  //calculate all the distances within all the results
  distances =  registersIndexes.reduce(function (prevVal, registerIndex) {
    return prevVal + registersIndexes.reduce(function (prevRegisterVal, currentRegisterIndex) {
      return prevRegisterVal + euclidianDistance(allRegisters[registerIndex], allRegisters[currentRegisterIndex]);
    }, 0);
  }, 0);

  // This division is to eliminate all duplicated results with are all the results because
  // results below and above the diagonal are exactly the same and all the diagonal results
  // are zero.
  return distances / 2;
}
