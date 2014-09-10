/**
 * Created by roc on 01/06/14.
 */
"use strict";

/*global describe */
/*global it */
/*global expect */
/*global beforeEach */

var Kmeans = require("../../../lib/dataMining/clustering/Kmeans"),
    _ = require("lodash");

var kmeans;

describe("Kmeans", function () {

  beforeEach(function () {
    kmeans = new Kmeans();
  });

  it("Error - setConfig - Wrong type in property 'centroids'", function () {

    expect(function () {
      kmeans.setConfig({
        centroids: "foobar"
      });
    }).toThrow("'centroids' property needs to be an array or a number");
  });

  it("Error - setConfig - Empty array in 'centroids'", function () {

    expect(function () {
      kmeans.setConfig({
        centroids: []
      });
    }).toThrow("'centroids' property can't be an empty array");
  });

  it("Error - setConfig - Wrong type in property 'similarity'", function () {

    expect(function () {
      kmeans.setConfig({
        similarity: 2
      });
    }).toThrow("'similarity' property needs to be a function");
  });

  it("Error - setConfig - Wrong type in property 'convergenceIterations'", function () {

    expect(function () {
      kmeans.setConfig({
        convergenceIterations: "foobar"
      });
    }).toThrow("'convergenceIterations' property needs to be an integer number");
  });

  it("Error - setConfig - 'convergenceIterations' more than zero", function () {

    expect(function () {
      kmeans.setConfig({
        convergenceIterations: -1
      });
    }).toThrow("'convergenceIterations' property needs to be more than zero");
  });

  it("Use - setConfig - all properties set", function () {
    var f = function () {};

    kmeans.setConfig({
      centroids: 2,
      similarity: f,
      convergenceIterations: 4
    });

    var config = kmeans.getConfig();

    expect(config.centroids === 2 && config.similarity === f && config.convergenceIterations === 4).toBeTruthy();
  });

  it("Use - setConfig - default value of 'centroids'", function () {

    kmeans.setConfig({});

    var config = kmeans.getConfig();

    expect(config.centroids).toBeDefined();
  });

  it("Use - setConfig - default value of 'similarity'", function () {

    kmeans.setConfig({});

    var config = kmeans.getConfig();

    expect(config.similarity).toBeDefined();
  });

  it("Use - setConfig - default value of 'convergenceIterations'", function () {

    kmeans.setConfig({});

    var config = kmeans.getConfig();

    expect(config.convergenceIterations).toBeDefined();
  });

  it("Error - execute - Kmeans never configured", function () {

    expect(function () {
      kmeans.execute();
    }).toThrow("Execute methods needs to be configured first via setConfig method");
  });

  it("Error - execute - Wrong type in method 'execute'", function () {

    kmeans.setConfig({});

    expect(function () {
      kmeans.execute(2);
    }).toThrow("First argument needs to be an array");
  });

  it("Error - execute - Empty array in method 'execute'", function () {

    kmeans.setConfig({});

    expect(function () {
      kmeans.execute([]);
    }).toThrow("First argument can't be an empty array");
  });

  it("Error - execute - Kmeans never configured", function () {
    var data = [
      [24,2974,38040,704743,46789987],
      [2,1592,87209,200333,12305767],
      [70,8945,70320,969340,98068799],
      [47,4700,10302,893011,35239178]
    ];

    kmeans.setConfig({
      centroids: [
        [24,2974,38040,704743],
        [47,4700,10302,893011]
      ]
    });

    expect(function () {
      kmeans.execute(data);
    }).toThrow("Number of attributes of first argument don't match with number of attributes of centroids");
  });

  it("Use - execute - coherent result data", function () {
    var data = [
          [24,2974,38040,704743,46789987],
          [2,1592,87209,200333,12305767],
          [70,8945,70320,969340,98068799],
          [47,4700,10302,893011,35239178]
        ],
        result,
        resExpect;

    kmeans.setConfig({
      centroids: 2
    });

    result = kmeans.execute(data);

    resExpect = _.isArray(result.centroids) && result.centroids.length === 2;
    resExpect = resExpect && _.isArray(result.centroidOfRegisters) && result.centroidOfRegisters.length === data.length;

    expect(resExpect).toBeTruthy();
  });

  it("Use - execute - same centroids", function () {
    var data = [
          [24,2974,38040,704743,46789987],
          [2,1592,87209,200333,12305767],
          [70,8945,70320,969340,98068799],
          [47,4700,10302,893011,35239178]
        ],
        result;

    kmeans.setConfig({
      centroids: 4
    });

    result = kmeans.execute(data);

    result = result.centroids.filter(function (centroid) {
      return data.some(function (register) {
        return _.difference(register, centroid) === [];
      });
    });

    expect(result).toEqual([]);
  });
});
