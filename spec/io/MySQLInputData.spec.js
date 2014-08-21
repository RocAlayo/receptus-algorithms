"use strict";

/*global describe */
/*global it */
/*global expect */
/*global beforeEach */
/*global afterEach */

var MySQLInputData = require("../../lib/io/MySQLInputData"),
    mySQLInputData,
    mysql = require("mysql"),
    configObject = {
      host: "localhost",
      port: 3306,
      user: "root",
      password: "root",
      database: "test_jasmine"
    },
    data = [
       [1, "prova"]
    ];

describe("MySQLInputData", function () {

  beforeEach(function (done) {
    mySQLInputData = new MySQLInputData();
    var connection = mysql.createConnection(configObject);
    connection.connect();

    connection.query(
      "CREATE database test_jasmine;", function(err, results) {
      }
    );

    connection.query(
      "CREATE TABLE jasmine" +
        "(id INT(11) AUTO_INCREMENT, " +
        "name VARCHAR(255), " +
        "PRIMARY KEY (id));", function(err, results) {
        if (err) {
          throw err;
        }
      }
    );

    connection.query("insert into jasmine set ?", data, function(err, results) {
      if (err) {
        throw err;
      }
    });

    connection.end(function () {
      done();
    });
  });

  afterEach(function (done) {
    var connection = mysql.createConnection(configObject);
    connection.connect();

    connection.query("DROP TABLE jasmine", function(err, results) {
      if (err) {
        throw err;
      }
    });

    connection.end(function () {
      done();
    });
  });

  it("Use - basic", function (done) {
    mySQLInputData.config({
      connection: configObject,
      query: "SELECT * FROM jasmine"
    });

    mySQLInputData.getContent().then(function (results) {
      expect(results).toEqual(data);
      done();
    });
  });
});
