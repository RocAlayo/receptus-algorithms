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

  it("Error - setConfig - Wrong type of value in property 'k'", function () {
    expect(function () {
      knn.setConfig({
        k: "hello"
      });
    }).toThrow("'k' needs to be an integer");
  });

  it("Error - setConfig - Wrong type of value in property 'similarity'", function () {
    expect(function () {
      knn.setConfig({
        similarity: "hello"
      });
    }).toThrow("'similarity' property needs to be a function");
  });

  it("Error - setConfig - Wrong type of value in property 'predict'", function () {
    expect(function () {
      knn.setConfig({
        predict: "hello"
      });
    }).toThrow("'predict' property needs to be a plain object");
  });

  it("Error - setConfig - Wrong type of value in property 'predict.register'", function () {
    expect(function () {
      knn.setConfig({
        predict: {
          register: 2
        }
      });
    }).toThrow("'register' property of 'predict' needs to be an array");
  });

  it("Error - setConfig - Wrong type of value in property 'predict.attributes'", function () {
    expect(function () {
      knn.setConfig({
        predict: {
          attributes: "foo"
        }
      });
    }).toThrow("'attributes' property of 'predict' needs to be a number or an array");
  });

  it("Error - setConfig - Wrong type of value in property 'predict.excludedAttributes'", function () {
    expect(function () {
      knn.setConfig({
        predict: {
          excludedAttributes: "foo"
        }
      });
    }).toThrow("'excludedAttributes' property of 'predict' needs to be a number or an array");
  });

  it("Error - execute - Kmeans never configured", function () {

    expect(function () {
      knn.execute();
    }).toThrow("Execute methods needs to be configured first via setConfig method");
  });

  it("Error - execute - Wrong type in method 'execute'", function () {

    knn.setConfig({});

    expect(function () {
      knn.execute(2);
    }).toThrow("First argument needs to be an array");
  });

  it("Error - execute - Empty array in method 'execute'", function () {

    knn.setConfig({});

    expect(function () {
      knn.execute([]);
    }).toThrow("First argument can't be an empty array");
  });

  it("Error - execute - Length of register and data don't match", function () {

    knn.setConfig({
      predict: {
        register: [2,2]
      }
    });

    expect(function () {
      knn.execute([
        [2,2,9],
        [7,4,3]
      ]);
    }).toThrow("Registers of argument need to have same number of properties than 'params.predict.register'");
  });

  it("Use - execute - same register", function () {
    var res;

    knn.setConfig({
      k: 10,
      predict: {
        register: [null, 2, 4, 3],
        attributes: 0
      }
    });

    res = knn.execute([
      [10, 2, 4, 3]
    ]);

    expect(res[0]).toEqual(10);
  });

  it("Use - execute - two registers with equal attributes as register", function () {
    var res;

    knn.setConfig({
      k: 10,
      predict: {
        register: [null, 2, 4, 3],
        attributes: 0
      }
    });

    res = knn.execute([
      [5, 2, 4, 3],
      [10, 2, 4, 3]
    ]);

    expect(res[0]).toEqual(7.5);
  });

  it("Use - execute - number of attributes predicted", function () {
    var res;

    knn.setConfig({
      k: 10,
      predict: {
        register: [null, 2, null, 3],
        attributes: [0, 2]
      }
    });

    res = knn.execute([
      [5, 1, 3, 8],
    ]);

    expect(Object.keys(res).length === 2 && _.values(res).every(_.isFinite)).toBeTruthy();
  });

  it("Use - execute - result without special cases", function () {
    var res;

    knn.setConfig({
      k: 2,
      predict: {
        register: [null, 2, null, 3],
        attributes: [0, 2]
      }
    });

    res = knn.execute([
      [5, 1, 3, 8],
      [10, 4, 7, 10],
      [15, 3, 6, 2]
    ]);

    expect(_.values(res).every(_.isFinite)).toBeTruthy();
  });
});
