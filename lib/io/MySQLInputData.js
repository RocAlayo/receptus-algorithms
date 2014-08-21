"use strict";

var Receptus = require("receptus"),
  _ = require("lodash"),
  dataInterface = Receptus.interfaces.InputData,
  mysql = require("mysql");


// https://github.com/felixge/node-mysql

function MySQLInputData() {
  this.params = {};
  this.defaultParams = {
    connection: {
      host: "localhost",
      port: 54000, //3306,
      user: "root",
      password: "lopassword",
      database: "test"
    }, //or string like "mysql://user:pass@host/db?debug=true&charset=BIG5_CHINESE_CI&timezone=-0700"
    query: ""
  };
}

MySQLInputData.prototype = Object.create(dataInterface);

MySQLInputData.prototype.setConfig = function setConfigFunc(params) {
  this.params = _.defaults(params,this.defaultParams);

  //TODO: validation of all th parameters

  this.connection = mysql.createConnection(this.params.connection);
};

MySQLInputData.prototype.getConfig = function getConfigFunc() {
  return this.params;
};

MySQLInputData.prototype.getContent = function getFunc() {
  var that = this;

  return new Receptus.Promise(function (resolve, reject) {
    that.connection.connect();

    that.connection.query(that.params.query, function(err, rows, fields) {
      if (err) {
        reject(err);
      }

      rows.headers = fields;

      resolve(rows);
    });

    that.connection.end();
  });
};

module.exports = MySQLInputData;