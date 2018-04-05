'use strict';
var BaseJob;
BaseJob = require('./_BaseJob');

class VerifyTemplateFill extends BaseJob {

    //todo: analyze the validation of orientation (set enumerator) && validation inconsistency (set enumerator)

    /**
     * Run Job Script
     * Checks the fill of the alternatives of questions
     * @param canvas {Object} canvas
     * @param context {Object} context canvas
     * @param image {Object} image
     * @param template {Object} template information
     * @param pixelCorners {Object} corners information
     * @param orientation
     * @callback
     */
    static Run(canvas, context, image, template, pixelCorners, orientation) {

        let x, y, c,//counts
            higherPercentage = 0,
            smallerPercentage = 100,
            alternativeFill = {},
            columnNumberQuestions,
            arrayData = [],
            arrPercentage = [],
            arrInsertAnswers = [],
            cropFunction,
            darkImage = false;

        try {

            //todo: review validation number of questions
            let lines = template.columns == 1 ? template.items.length : template.questions;
            columnNumberQuestions = ( lines / template.columns );

            // darkImage = VerifyTemplateFill.verifyImageIntensity(pixelCorners, context) || false;
            darkImage = false;
            image.data = context.getImageData(pixelCorners.baseX, pixelCorners.baseY, pixelCorners.baseWidthWithOffset, pixelCorners.baseHeightWithOffset);

            //image.data = context.getImageData(0, 0, image.data.width, image.data.height);
            VerifyTemplateFill.clearCanvas(canvas, context, image);

            if (orientation === "PORTRAIT") {
                cropFunction = VerifyTemplateFill.cropImageDataPortrait;
            } else if (orientation === "LANDSCAPE") {
                cropFunction = VerifyTemplateFill.cropImageDataLandscape;
            }

            //Column questions
            for (c = 0; c < template.columns; c++) {

                //Row questions
                for (y = 0; y < columnNumberQuestions; y++) {

                    arrayData.push([]);

                    //alternatives for each question
                    for (x = 0; x < template.alternatives; x++) {

                        arrayData[(c * columnNumberQuestions) + y].push([]);
                        arrayData[(c * columnNumberQuestions) + y][x] = cropFunction(context, x, y, pixelCorners.tileWidth, pixelCorners.tileHeight, c, template.alternatives);

                        arrPercentage.push(VerifyTemplateFill.getFillPercent(arrayData[(c * columnNumberQuestions) + y][x], 130));

                        //Is the LARGEST filled percentage of alternatives for each question
                        if (arrPercentage[x] >= higherPercentage) {
                            higherPercentage = arrPercentage[x];
                            alternativeFill = {
                                alternative: x,
                                inconsistency: false,
                                higherPercentage: higherPercentage,
                                arrPercentage: arrPercentage
                            };
                        }

                        //Find the LOWEST filled percentage of alternatives for each question
                        if (arrPercentage[x] <= smallerPercentage) {
                            smallerPercentage = arrPercentage[x];
                            alternativeFill.smallerPercentage = smallerPercentage;
                        }
                    }

                    VerifyTemplateFill.verifyErasure(arrPercentage, alternativeFill, darkImage, y);
                    VerifyTemplateFill.verifyNull(arrPercentage, alternativeFill, darkImage, y);

                    //feeds the array with the embedded answers
                    arrInsertAnswers.push(alternativeFill);

                    //reset variables foreach questions processed
                    higherPercentage = 0;
                    smallerPercentage = 100;
                    alternativeFill = {};
                    arrPercentage = [];
                }
            }

            //console.log(arrInsertAnswers);

            VerifyTemplateFill.Data.insertedAnswers = arrInsertAnswers;
            VerifyTemplateFill.callback();
        } catch (err) {
            VerifyTemplateFill.callback(err);
        }
    }

    /**
     * --- DEPRECATED ---
     * @param pixelCorners
     * @param context
     * @returns {boolean}
     */
    static verifyImageIntensity(pixelCorners, context) {

        let imageDataLine;
        let baseX = pixelCorners.topLeft.x + pixelCorners.tileWidth;
        let baseY = pixelCorners.topLeft.y + (pixelCorners.tileHeight * pixelCorners.tileOffsetY);
        let percentageLine;
        imageDataLine = context.getImageData(baseX, baseY, pixelCorners.tileWidth, pixelCorners.tileHeight);
        percentageLine = VerifyTemplateFill.getFillPercent(imageDataLine, 130);

        if (percentageLine > 10)
            return true;
    }

    /**
     *
     * @param arrPercentage
     * @param alternativeFill
     * @param darkImage
     * @param question
     */
    static verifyNull(arrPercentage, alternativeFill, darkImage, question) {

        let thresholdPercentage = darkImage && !(question % 2) ? 50 : 10;
        let countUnfilled = 0;
        for (let z = 0; z < arrPercentage.length; z++) {
            if (arrPercentage[z] < thresholdPercentage) {
                countUnfilled++;
            }
        }

        if (countUnfilled === arrPercentage.length) {
            alternativeFill.inconsistency = "null";
        }
    }

    /**
     *
     * @param arrPercentage
     * @param alternativeFill
     * @param darkImage
     * @param question
     */
    static verifyErasure(arrPercentage, alternativeFill, darkImage, question) {
        let thresholdPercentage = darkImage && !(question % 2) ? .8 : .6;
        for (let z = 0; z < arrPercentage.length; z++) {
            if (alternativeFill.alternative != z) {
                //Gives the alternatives and identifies the question that owning fill inconsistency
                if (arrPercentage[z] > alternativeFill.higherPercentage * thresholdPercentage) {
                    alternativeFill.inconsistency = "erased";
                    break;
                }
            }
        }
    }

    /**
     *
     * @param canvas
     * @param context
     * @param image
     */
    static clearCanvas(canvas, context, image) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        canvas.width = image.data.width;
        canvas.height = image.data.height;
        context.putImageData(image.data, 0, 0);
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
    static cropImageDataPortrait(context, x, y, tileWidth, tileHeight) {
        return context.getImageData(tileWidth * y, tileHeight * x, tileWidth, tileHeight);
    }

    /**
     *
     * @param context
     * @param x
     * @param y
     * @param tileWidth
     * @param tileHeight
     * @param column
     * @param alternatives
     * @returns {ImageData}
     * @constructor
     */
    static cropImageDataLandscape(context, x, y, tileWidth, tileHeight, column, alternatives) {
        return context.getImageData(tileWidth * ( x + (column * (alternatives + 1) ) ), tileHeight * y, tileWidth, tileHeight);
    }

    /**
     *
     * Method that returns the percentage of fill levels of an image based on a threshold value
     * @param imageData {Object} image date
     * @param threshold {Number} threshold binarization
     * @return {number}
     */
    static getFillPercent(imageData, threshold) {

        let count = 0;

        for (let i = 0; i < imageData.data.length; i += 4) {
            if ((imageData.data[i] <= threshold) && (imageData.data[i + 4] <= threshold) && (imageData.data[i + 8] <= threshold)) {
                count += 1;
            }
        }

        return Math.round((count * 4) / (imageData.data.length / 100));
    }
}

module.exports = VerifyTemplateFill;