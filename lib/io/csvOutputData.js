"use strict";

var OutputData = require("receptus").OutputData,
  csvOutputData;

function formatter(data) {
  var res = "";

  data.forEach(function (register) {
    res += register.join(",") + "\n";
  });

  return res;
}

csvOutputData = new OutputData(formatter);

csvOutputData.name = "csvOutputData";

module.exports = csvOutputData;
