/**
 * Created by roc on 01/06/14.
 */
"use strict";

/*global describe */
/*global it */
/*global expect */
/*global afterEach */
/*global beforeEach */

var MongoDBInputData = require("../../lib/io/MongoDBInputData"),
    mongoDBInputData,
    MongoClient = require("mongodb").MongoClient,
    data = [
      { name: "prova"}
    ];

describe("MongoDBInputData", function () {

  beforeEach(function (done) {
    mongoDBInputData = new MongoDBInputData();
    MongoClient.connect("mongodb://127.0.0.1:27017/test", function (err, db) {
      if(err) {
        throw err;
      }

      var collection = db.collection("jasmine");
      collection.insert(data, function(err, docs) {
        if(err) {
          throw  err;
        }

        db.close();
        done();
      });
    });
  });

  afterEach(function (done) {
    MongoClient.connect("mongodb://127.0.0.1:27017/test", function (err, db) {
      if(err) {
        throw err;
      }

      var collection = db.collection("jasmine");
      collection.remove(null, function (err,result) {
        if(err) {
          throw err;
        }

        db.close();
        done();
      });
    });
  });

  it("Use - basic", function (done) {

    mongoDBInputData.setConfig({
      connection: "mongodb://127.0.0.1:27017/test",
      query: {
        collection: "jasmine",
        query: null
      }
    });

    mongoDBInputData.getContent().then(function (results) {
      expect(results).toEqual(data);
      done();
    });
  });
});
