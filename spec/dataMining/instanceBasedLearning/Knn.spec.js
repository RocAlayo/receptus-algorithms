"use strict";

/*global describe */
/*global it */
/*global expect */
/*global beforeEach */

var Knn = require("../../../lib/dataMining/instanceBasedLearning/Knn"),
    _ = require("lodash");

var knn;

describe("Knn", function () {

  beforeEach(function () {
    knn = new Knn();
  });

  /*it("Use - execute - same centroids", function () {
    var data = [
        [24,2974,38040,704743,46789987],
        [2,1592,87209,200333,12305767],
        [70,8945,70320,969340,98068799],
        [47,4700,10302,893011,35239178]
      ],
      result;

    knn.setConfig({
      centroids: 4
    });

    result = knn.execute(data);

    expect(result.centroids).toEqual(data);
  });*/
});
