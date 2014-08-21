/**
 * Created by roc on 01/06/14.
 */
"use strict";

/*global describe */
/*global it */
/*global expect */
/*global beforeEach */

var ArffInputData = require("../../lib/io/ArffInputData"),
    arffInputData;

describe("ArffInputData", function () {

  beforeEach(function () {
    arffInputData = new ArffInputData();
  });

  it("Error - don't have property 'files'", function () {

    expect(function () {
      arffInputData.setConfig({
        files: 12
      });
    }).toThrow("'files' property needs to be a plain object or string");
  });

  it("Error - don't have property 'files'", function () {

    expect(function () {
      arffInputData.setConfig({
        files: {
          header: 12,
          data: ""
        }
      });
    }).toThrow("'data' and 'header' values of object 'files' need to be a string");
  });

  it("Use - header and data separated", function (done) {
    arffInputData.setConfig({
      files: {
        header: __dirname + "/../testFiles/diabetes-header.arff",
        data: __dirname + "/../testFiles/diabetes-data.arff"
      }
    });

    arffInputData.getContent().then(function (result) {
      expect(result[0].length === 9 && result.headers.length === 9).toBeTruthy();
      done();
    });
  });

  it("Use - header and data in same file", function (done) {
    arffInputData.setConfig({
      files: __dirname + "/../testFiles/diabetes-all.arff"
    });

    arffInputData.getContent().then(function (result) {
      expect(result[0].length === 9 && result.headers.length === 9).toBeTruthy();
      done();
    });
  });

  it("Use - same file without class", function (done) {
    arffInputData.setConfig({
      files: __dirname + "/../testFiles/diabetes-all.arff",
      classAttribute: {
        name: "class",
        remove: true
      }
    });

    arffInputData.getContent().then(function (result) {
      expect(result[0].length === 8 && result.headers.length === 8).toBeTruthy();
      done();
    });
  });

  it("Use - separated files without class", function (done) {
    arffInputData.setConfig({
      files: {
        header: __dirname + "/../testFiles/diabetes-header.arff",
        data: __dirname + "/../testFiles/diabetes-data.arff"
      },
      classAttribute: {
        name: "class",
        remove: true
      }
    });

    arffInputData.getContent().then(function (result) {
      expect(result[0].length === 8 && result.headers.length === 8).toBeTruthy();
      done();
    });
  });

  it("Use - header and data separated - sparse", function (done) {
    arffInputData.setConfig({
      files: {
        header: __dirname + "/../testFiles/diabetes-header.arff",
        data: __dirname + "/../testFiles/diabetes-data-sparse.arff"
      }
    });

    arffInputData.getContent().then(function (result) {
      expect(result[0].length === 9 && result.headers.length === 9).toBeTruthy();
      done();
    });
  });

  it("Use - header and data in same file - sparse", function (done) {
    arffInputData.setConfig({
      files: __dirname + "/../testFiles/diabetes-all-sparse.arff"
    });

    arffInputData.getContent().then(function (result) {
      expect(result[0].length === 9 && result.headers.length === 9).toBeTruthy();
      done();
    });
  });

  it("Use - same file without class - sparse", function (done) {
    arffInputData.setConfig({
      files: __dirname + "/../testFiles/diabetes-all-sparse.arff",
      classAttribute: {
        name: "class",
        remove: true
      }
    });

    arffInputData.getContent().then(function (result) {
      expect(result[0].length === 8 && result.headers.length === 8).toBeTruthy();
      done();
    });
  });

  it("Use - separated files without class - sparse", function (done) {
    arffInputData.setConfig({
      files: {
        header: __dirname + "/../testFiles/diabetes-header.arff",
        data: __dirname + "/../testFiles/diabetes-data-sparse.arff"
      },
      classAttribute: {
        name: "class",
        remove: true
      }
    });

    arffInputData.getContent().then(function (result) {
      expect(result[0].length === 8 && result.headers.length === 8).toBeTruthy();
      done();
    });
  });
});
