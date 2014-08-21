"use strict";

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

  registersClusters.forEach(function (registerCluster) {
    nk[registerCluster]++;
  });

  sk = nk.map(function(currNk) {
    var currSk = 0;

    //TODO: resoldre que es el que son les || de la formula per a poder-ho aplicar

    currSk /= currNk * currNk;
    return currSk;
  });

  result = nk.reduce(function (prevVal, currNk, index) {
    return prevVal + (currNk * sk[index]);
  }, result);

  result /= 2;

  return result;
};
