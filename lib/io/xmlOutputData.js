"use strict";

var OutputData = require("receptus").OutputData,
    xmlFormatter;

function formatter(data) {
  //passar les dades a xml
  return data;
}

xmlFormatter = new OutputData(formatter);

xmlFormatter.name = "xmlOutputData";

module.exports = xmlFormatter;