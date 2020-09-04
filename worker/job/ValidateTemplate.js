'use strict';
var BaseJob;
BaseJob = require('./_BaseJob');

class ValidateTemplate extends BaseJob {

    /**
     * Run Job Script
     * Checks the pattern of template
     * @param Canvas {Function} Canvas module
     * @param context {Object} context canvas
     * @param pixelCorners {Object} corners information
     * @param template {Object} template information
     * @param offSet {Object} template offSet
     * @callback
     */
    static Run(Canvas, context, pixelCorners, template, offSet) {

        try {

            let arrPercentage = [],
                imgDataTemporary,
                cropFunction,
                percentage,
                canvasTemp,
                contextTemp,
                firstTileFill,
                centerTileFill,
                lastTileFill,
                numTilesWidth;

            imgDataTemporary = context.getImageData(pixelCorners.topLeft.x, pixelCorners.topLeft.y, pixelCorners.baseWidth, pixelCorners.tileHeight);
            canvasTemp = new Canvas(pixelCorners.baseWidth, pixelCorners.tileHeight);
            contextTemp = canvasTemp.getContext("2d");
            contextTemp.putImageData(imgDataTemporary, 0, 0);
            cropFunction = ValidateTemplate.CropImageData;

            numTilesWidth = (template.alternatives * template.columns) + ( (offSet.LEFT + offSet.RIGHT) + (template.columns - 1));

            for (let x = 0; x < numTilesWidth; x++) {
                imgDataTemporary = cropFunction(contextTemp, x * pixelCorners.tileWidth, 0, pixelCorners.tileWidth, pixelCorners.tileHeight);
                percentage = ValidateTemplate.GetFillPercent(imgDataTemporary, 50);
                arrPercentage.push([percentage]);
            }

            firstTileFill = false;
            centerTileFill = false;
            lastTileFill = false;

            for (let x = 0; x < arrPercentage.length; x++) {
                if (x === 0 && arrPercentage[x] >= 30) {
                    firstTileFill = true;
                } else if (x === arrPercentage.length - 1 && arrPercentage[x] >= 30) {
                    lastTileFill = true;
                } else if (arrPercentage[x] >= 18) {
                    centerTileFill = true;
                }
            }

            //console.log(arrPercentage);
            //console.log("---");
            //console.log(firstTileFill);
            //console.log(centerTileFill);
            //console.log(lastTileFill);

            if (!firstTileFill || centerTileFill || !lastTileFill) {
                ValidateTemplate.callback(new Error("Pattern template not found. First:" + firstTileFill + " Center:" + centerTileFill + " Last:" + lastTileFill));
            } else {
                ValidateTemplate.callback();
            }
        } catch (err) {
            ValidateTemplate.callback(err);
        }
    }

    /**
     *
     * @param context
     * @param x
     * @param y
     * @param tileWidth
     * @param tileHeight
     * @returns {ImageData}
     * @constructor
     */
    static CropImageData(context, x, y, tileWidth, tileHeight) {
        return context.getImageData(x, y, tileWidth, tileHeight);
    }

    /**
     * Run Job Script
     * Method that returns the percentage of fill levels of an image based on a threshold value
     * @param imageData {Object} image date
     * @param threshold {Number} threshold binarization
     * @callback
     * @return {number}
     */
    static GetFillPercent(imageData, threshold) {

        var count = 0, i;//counts

        for (i = 0; i < imageData.data.length; i += 4) {
            if ((imageData.data[i] <= threshold) && (imageData.data[i + 4] <= threshold) && (imageData.data[i + 8] <= threshold)) {
                count += 1;
            }
        }

        return Math.round((count * 4) / (imageData.data.length / 100));
    }
}

module.exports = ValidateTemplate;