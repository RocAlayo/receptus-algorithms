"use strict";

var Receptus = require("receptus"),
    receptusAlgorithms = require("../../lib/index"),
    _ = require("lodash"),
    receptus = new Receptus({
        path: receptusAlgorithms()
    }),
    header,
    dataMissingValues = [];


// Retrieve dataset data
receptus.saveStep("getData",function (CsvInputData) {
  var csvInputData = new CsvInputData();
  csvInputData.setConfig({
    "path": __dirname + "/data.csv",
    "excludedColumns": 0,
    "header": false
  });

  return csvInputData.getContent();
});

// Retrieve header of the dataset
receptus.saveStep("getHeader",function (CsvInputData) {
  var csvInputData = new CsvInputData();
  csvInputData.setConfig({
    "path": __dirname + "/header.csv",
    "separator": {
      "register": "\n",
      "attribute": ","
    },
    "header": true
  });

  return csvInputData.getContent();
});

// Parallel retrieving of dataset file an header file
receptus.step(true, ["getHeader", "getData"])
// Giving a good format to the header data
.step(function ($data) {
  header = $data[0];

  // Transforming matrix to array of objects
  header = header.map(function (attribute) {
    var obj = {};
    header.headers.forEach(function (name, index) {
      obj[name] = attribute[index];
    });
    return obj;
  });

  // Get the parser for every type of attribute
  header.forEach(function (attribute, index, array) {
    if(attribute.type === "integer") {
      attribute["parser"] = function parseIntCustom(num) {
        return parseInt(num, 10);
      };
    } else if (attribute.type === "real") {
      attribute["parser"] = parseFloat;
    }

    attribute["min"] = attribute.parser(attribute["min"]);
    attribute["max"] = attribute.parser(attribute["max"]);
  });

  // Return only the dataset data
  return $data[1];
})
// Filter registers without missing attributes
.step(function ($data) {
  var dataNoMissValues = [];

  $data.forEach(function (register, indexData) {
    var newRegister,
        hasMissingValues;

    // Parsing attributes
    newRegister = register.map(function (attribute, index) {
      return header[index].parser(attribute);
    });

    // Normalizing attributes
    newRegister = newRegister.map(function (attribute, index) {
      return (attribute - header[index].min) / (header[index].max - header[index].min);
    });

    // Searching for missing values
    hasMissingValues = newRegister.some(function (attribute) {
      return _.isNaN(attribute);
    });

    // Filtering attributes
    if(hasMissingValues) {
      dataMissingValues.push(newRegister);
    } else {
      dataNoMissValues.push(newRegister);
    }
  });

  return dataNoMissValues;
})
.step(function ($data, randomCentroids, kmeans, euclideanDistance) {
  var result;

  kmeans.setConfig({
    centroids: randomCentroids($data, 3),
    similarity: euclideanDistance,
    convergenceIterations: 5
  });

  result =  kmeans.execute($data);

  return {
    centroids: result.centroids,
    rowData: $data,
    dataCentroids: result.centroidOfRegisters
  };
})
// Estimate all missing attributes from registers with some missing attribute
.step(function ($centroids, euclideanDistance, $rowData) {
  dataMissingValues.forEach(function (register) {
    var indexesOfMissingValues,
        indexCentroid;

    // Getting indexes of all the missing attributes in a register
    indexesOfMissingValues = register.map(function (attribute, index) {
      if(_.isNaN(attribute)) {
        return index;
      } else {
        return -1;
      }
    }).filter(function (index) {
      return index >= 0;
    });

    // Getting index of the centroid that is more close to register
    indexCentroid = $centroids.map(function (centroid) {
      return euclideanDistance(centroid, register, indexesOfMissingValues);
    }).reduce(function (prevIndex, currentVal, currentIndex, array) {
      return currentVal < array[prevIndex] ? currentIndex : prevIndex;
    }, 0);

    // Estimating all the missing values with the values of the centroid
    indexesOfMissingValues.forEach(function (index) {
      register[index] = $centroids[indexCentroid][index];
    });
  });

  return $rowData.concat(dataMissingValues);
})
// Validate that there are no more missing values
.step(function ($data) {
  var noMissingValues = $data.every(function (register) {
    return !register.some(function (attribute) {
      return _.isNaN(attribute);
    });
  });

  if(noMissingValues) {
    return $data;
  } else {
    throw new Error("There is still some missing values.");
  }
})
// Denormalization of all the attributes of all registers
.step(function ($data) {
  var data = $data.map(function (register) {
    return register.map(function (attribute, index) {
      return (attribute * (header[index].max - header[index].min)) + header[index].min;
    });
  });

  return data;
})
// Saving dataset without missing values in a file
.step(function ($data, csvOutputData) {
  var fileContent = csvOutputData.execute($data),
    writeFile = Receptus.Promise.promisify(require("fs").writeFile);

  return writeFile(__dirname + "/output.csv", fileContent);
})
.step(function () {
  console.log("All missing values had been replaced with estimations and saved at output.csv");
})
.error(function ($error) {
  console.log($error.stack);
});
