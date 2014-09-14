"use strict";

var Receptus = require("receptus"),
    fs = require("fs"),
    _ = require("lodash"),
    dataInterface = Receptus.interfaces.InputData;

function CsvInputData() {
  this.params = {};
  this.defaultParams = {
    separator: {
      register: "\n",
      attribute: ","
    },
    "header": false,
    "excludedColumns": false,
    "sampleOf": false
  };



  //TODO: options to remove class attribut
  //TODO: options to specify if header is included and where is included
}

CsvInputData.prototype = Object.create(dataInterface);

CsvInputData.prototype.getConfig = function getConfigFunc() {
  return this.params;
};

CsvInputData.prototype.setConfig = function setConfigFunc(params) {
  this.params = _.defaults(params,this.defaultParams);


  if(_.isNumber(this.params.excludedColumns)) {
      this.params.excludedColumns = [this.params.excludedColumns];
  } else if (_.isBoolean(this.params.excludedColumns) && !this.params.excludedColumns) {
      this.params.excludedColumns = [];
  }
  //TODO: validation of all the parameters
};

CsvInputData.prototype.getContent = function getContentFunc() {
  var readFile = Receptus.Promise.promisify(fs.readFile),
      that = this;

  return readFile(this.params.path, "utf8").then(function (data) {
    var rows = data.trim().split(that.params.separator.register),
        names;

    rows = rows.map(function (row) {
      var attributes = row.split(that.params.separator.attribute);

      if (that.params.excludedColumns.length > 0) {
        attributes = attributes.filter(function (value, index) {
          return that.params.excludedColumns.indexOf(index) === -1;
        });
      }

      return attributes;
    });

    if (that.params.header) {
      names = rows[0];
      rows = rows.splice(1);
      rows.headers = names;
    }

    if(that.params.sampleOf) {
      return _.sample(rows, that.params.sampleOf);
    }
    return rows;
  });
};

module.exports = CsvInputData;
