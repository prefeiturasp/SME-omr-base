'use strict';
var BaseJob;
BaseJob = require('./_BaseJob');

class GetFillPercent extends BaseJob {

    /**
     * Run Job Script
     * Method that returns the percentage of fill levels of an image based on a threshold value
     * @param image {Object} image
     * @param threshold {Number} threshold binarization
     * @callback
     * @return {number}
     */
    static Run(image, threshold) {

        var count = 0, i;//counts
        var imageData = image.data;

        try {
            for (let i = 0; i < imageData.data.length; i += 4) {
                if ((imageData.data[i] <= threshold) && (imageData.data[i + 4] <= threshold) && (imageData.data[i + 8] <= threshold)) {
                    count += 1;
                }
            }

            GetFillPercent.Data.fillPercent = Math.round((count * 4) / (imageData.data.length / 100));
            GetFillPercent.callback();
        } catch (err) {
            GetFillPercent.callback(err);
        }
    }
}

module.exports = GetFillPercent;