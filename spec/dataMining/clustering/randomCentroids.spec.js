/**
 * Created by roc on 01/06/14.
 */
"use strict";

var randomCentroids = require("../../../lib/dataMining/clustering/positionOfCentroids/randomCentroids"),
    _ = require("lodash");

/*global describe */
/*global it */
/*global expect */

describe("randomCentroids", function () {
    it("Error - more clusters than data", function () {
        var data = [
            [24,2974,38040,704743],
            [2,1592,87209,200333],
            [70,8945,70320,969340],
            [47,4700,10302,893011]
        ];

        expect(function () {
            randomCentroids(data, 5);
        }).toThrow("Data is too small for the number of clusters");
    });

    it("Use - more data than clusters", function () {
        var data = [
                [24,2974,38040,704743],
                [2,1592,87209,200333],
                [70,8945,70320,969340],
                [47,4700,10302,893011]
            ],
            centroids = randomCentroids(data, 2),
            res  = centroids.length === 2 && centroids[0].length === 4;

        res = res && centroids.every(function (centroid) {
            return data.indexOf(centroid) !== 1;
        });

        expect(res).toBeTruthy();
    });

    it("Use - same data than clusters", function () {
        var data = [
                [24,2974,38040,704743],
                [2,1592,87209,200333],
                [70,8945,70320,969340],
                [47,4700,10302,893011]
            ],
            centroids = randomCentroids(data, 4),
            res  = centroids.length === 4 && centroids[0].length === 4;

        res = res && centroids.every(function (centroid) {
            return data.indexOf(centroid) !== 1;
        });

        expect(res).toBeTruthy();
    });
});