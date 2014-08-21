"use strict";

var Receptus = require("receptus"),
    _ = require("lodash"),
    dataInterface = Receptus.interfaces.InputData,
    MongoClient = require("mongodb").MongoClient;

// https://github.com/mongodb/node-mongodb-native

function MongoDBInputData() {
  this.params = {};
  this.defaultParams = {
    connection: {
      host: "127.0.0.1",
      port: 55000, // 27017,
      //user: "root",
      //password: "lopassword",
      database: "test"
    }, //or "mongodb://127.0.0.1:27017/test"
    query: {
      collection: "test",
      query: null
    }
  };
}

MongoDBInputData.prototype = Object.create(dataInterface);

MongoDBInputData.prototype.setConfig = function setConfigFunc(params) {
  this.params = _.defaults(params,this.defaultParams);
};

MongoDBInputData.prototype.getConfig = function getConfigFunc() {
  return this.params;
};

MongoDBInputData.prototype.getContent = function getFunc() {
  var promisify = Receptus.Promise.promisify,
      connect = promisify(MongoClient.connect),
      that = this;

  return connect(this.params.connection).then(function (db) {
    var collection = db.collection(that.params.query.collection);
    return new Receptus.Promise(function (resolve, reject) {
      collection.find(that.params.query.query).toArray(function (err, results) {
        db.close();

        if(err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });




  });
};

module.exports = MongoDBInputData;