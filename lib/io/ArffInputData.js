"use strict";

var Receptus = require("receptus"),
    fs = require("fs"),
    _ = require("lodash"),
    dataInterface = Receptus.interfaces.InputData,
    readFile = Receptus.Promise.promisify(fs.readFile);


/**
 * Specification extracted from http://www.cs.waikato.ac.nz/ml/weka/arff.html
 *
 *
 * @constructor
 */
function ArffInputData() {
  this.params = {};
  this.defaultParams = {
    files: {
      data: "",
      header: ""
    },
    classAttribute: {
      name: "class",
      remove: false
    }
  };
}

ArffInputData.prototype = Object.create(dataInterface);

ArffInputData.prototype.getConfig = function getConfigFunc() {
  return this.params;
};

ArffInputData.prototype.setConfig = function setConfigFunc(params) {
  this.params = _.defaults(params,this.defaultParams);

  if(!_.isPlainObject(this.params.files) && !_.isString(this.params.files)) {
    throw new Error("'files' property needs to be a plain object or string");
  } else if (_.isPlainObject(this.params.files) && (!_.isString(this.params.files.header) || !_.isString(this.params.files.data))) {
    throw new Error("'data' and 'header' values of object 'files' need to be a string");
  }
};

ArffInputData.prototype.getContent = function getContentFunc() {
  var that = this;


  if(_.isPlainObject(this.params.files)) { //Header and data in two different files
    return parseHeaderFile(that, this.params.files.header).then(function (headerResult) {
      return parseDataFile(that, that.params.files.data, headerResult).then(function (data) {
        data.headers = headerResult;
        return data;
      });
    });
  }

  //all in the same file
  return readFile(this.params.files, "utf8").then(function (data) {
    var rows = data.trim().split("\n"),
        isHeader = true,
        i,
        ret = [],
        header = [],
        temp,
        row;

    for(i = 0; i < rows.length; i++) {
      row = rows[i].trim();

      //ignore line comments
      if(row.charAt(0) === "%") {
        continue;
      }

      //remove comments inline with relevant data
      temp = row.split("%");
      row = temp[0];

      if(row === "@data") {
        isHeader = false;
        continue;
      }

      if(isHeader) {
        if(row.split(" ")[0].trim() === "@relation") {
          header.realtion = row.split(" ")[1].trim();
          continue;
        }

        row = parseRowHeaderSection(row);

        if(that.params.classAttribute.remove && that.params.classAttribute.name === row.name) {
          that.params.classAttribute.index = header.length;
          continue;
        }

        header.push(row);
      } else {
        row = parseRowDataSection(that, row, header);

        ret.push(row);
      }
    }

    ret.headers = header;

    return ret;
  });
};

function parseHeaderFile(obj, path) {
  return readFile(path, "utf8").then(function (data) {
    var rows = data.trim().split("\n"),
      i,
      ret = [],
      row;

    for(i = 0; i < rows.length; i++) {
      row = rows[i].trim();
      if(row.charAt(0) === "%") { //ignore comments
        continue;
      }

      row = row.split(" ");

      if(row[0].trim() === "@relation") {
        ret.relation = row[1].trim();
        continue;
      }

      row = parseRowHeaderSection(rows[i]);

      if(obj.params.classAttribute.remove && row.name === obj.params.classAttribute.name) {
        obj.params.classAttribute.index = ret.length;
        continue;
      }

      ret.push(row);
    }
    return ret;
  });
}

function parseDataFile(obj, path, header) {
  return readFile(path, "utf8").then(function (data) {
    var rows = data.trim().split("\n"),
      i,
      ret = [],
      row;

    for(i = 0; i < rows.length; i++) {
      row = rows[i].trim();
      if(row.charAt(0) === "%") { //ignore comments
        continue;
      }

      ret.push(parseRowDataSection(obj, row, header));
    }
    return ret;
  });
}


/**
 * Needs to be aware of sparse ARFF data section
 */
function parseRowDataSection(obj, row, header) {
  var sparseFormat = row.charAt(0) === "{" && row.charAt(row.length - 1) === "}",
      register = row.replace(/^\{|\}$/gi, "").split(","),
      ret = [],
      parser;

  register.forEach(function (attribute, index) {
    if (sparseFormat) {
      attribute = attribute.trim().split(" ");
      index = parseInt(attribute[0], 10) - 1;
      attribute = attribute[1];
      if(obj.params.classAttribute.remove && index === obj.params.classAttribute.index) {
        return;
      }
      parser = header[index].parser;

      ret[index] = parser ? parser(attribute) : attribute;
    } else {
      if(obj.params.classAttribute.remove && index === obj.params.classAttribute.index) {
        return;
      }
      parser = header[index].parser;

      ret.push(parser ? parser(attribute) : attribute);
    }
  });

  var i;
  if(sparseFormat && ret.length !== header.length) {
    for(i = header.length - ret.length; i > 0; i--) {
      ret.push(null);
    }
  }

  return ret;
}

function parseRowHeaderSection(row) {
  var ret = {},
      data = splitWithBlocks(row.trim(), " ", [
        {
          begin: "'",
          end: "'"
        },
        {
          begin: "{",
          end: "}"
        }
      ]);

  if(data[0].toLowerCase() === "@attribute") {

    ret.name = data[1].replace(/'/gi, "");

    switch(data[2].toLowerCase()) {
      case "numeric":
      case "real":
        ret.parser = parseFloat;
        ret.type = "numeric";
        break;
      case "date":
        if (data.length === 4) {
          ret.dateFormat = data[3];
        }
        ret.parser = null;
        ret.type = "date";
        break;
      case "string":
        ret.parser = null;
        ret.type = "string";
        break;
      default: //nominal-specification
        ret.setOfValues = data[2].split(",").map(function(value) { return value.trim(); });
        ret.parser = null;
        ret.type = "nominal";
    }
  }

  return ret;
}

function splitWithBlocks(string, separator, unseparable) {
  var res,
      indexBlocks = [],
      indexesSeparator = [],
      indexSep;

  //search for all couples of unseparable values and save their indexes
  unseparable.forEach(function (specs) {
    var indexBegin = string.indexOf(specs.begin),
        indexEnd = string.indexOf(specs.end, indexBegin+1),
        indexs = [];
    while (indexBegin >= 0 && indexEnd >= 0) {
      indexs.push(indexBegin);
      indexs.push(indexEnd);
      indexBlocks.push(indexs);
      indexs = [];
      indexBegin = string.indexOf(specs.begin, indexBegin+1);
      indexEnd = string.indexOf(specs.end, indexBegin+1);
    }
  });

  //search all indexes of separators in string
  indexSep = string.indexOf(separator);
  while (indexSep < string.length && indexSep >= 0) {
    indexesSeparator.push(indexSep);
    indexSep = string.indexOf(separator, indexSep+1);
  }

  //filter indexes separators to only those that are outside of couples of unseparables
  indexesSeparator = indexesSeparator.filter(function (indexVal) {
    return !indexBlocks.some(function (block) {
      return indexVal >= block[0] && indexVal <= block[1];
    });
  });

  //split string at filtered indexes
  indexesSeparator.push(string.length);
  var antValue = 0;
  res = indexesSeparator.map(function (value) {
    var sliceString = string.slice(antValue, value).trim().replace(/^['"\{\}]|['"\{\}]$/gi, "").trim();
    antValue = value;
    return sliceString;
  });

  return res;
}

module.exports = ArffInputData;
