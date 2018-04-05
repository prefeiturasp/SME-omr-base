'use strict';
var BaseJob;
BaseJob = require('./_BaseJob');

class ImageBin extends BaseJob {

    /**
     * Run Job Script
     * It makes a change in the image data channels based on a threshold, resulting in image binarization
     * @param context {Object} context canvas
     * @param image {Object} image
     * @param threshold {Number=} threshold binarization
     * @callback
     */
    static Run(context, image, threshold) {

        try {
            //papel comum = 180 | papel reciclado = 250
            threshold = threshold || 180;

            for (let i = 0; i < image.data.data.length; i += 4) {

                if ((image.data.data[i] > threshold) && (image.data.data[i + 1] > threshold) && (image.data.data[i + 2] > threshold)) {
                    image.data.data[i] = image.data.data[i + 1] = image.data.data[i + 2] = 255;
                } else {
                    image.data.data[i] = image.data.data[i + 1] = image.data.data[i + 2] = 0;
                }
            }

            context.putImageData(image.data, 0, 0);

            ImageBin.callback();
        } catch (err) {
            ImageBin.callback(err);
        }
    }
}

module.exports = ImageBin;