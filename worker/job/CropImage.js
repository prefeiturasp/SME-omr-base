'use strict';
var BaseJob;
BaseJob = require('./_BaseJob');

class CropImage extends BaseJob{

    /**
     * Run Job Script
     * Find the image clipping point
     * @param canvas {Object} canvas
     * @param context {Object} context canvas
     * @param image {Object} image
     * @param x {Number=} point x image to start the clipping
     * @param y {Number=} point y image to start the clipping
     * @param width {Number=} width image
     * @param height {Number=} height image
     * @callback
     */
    static Run(canvas, context, image, x, y, width, height) {

        try {
            x =  (x * canvas.width) || 0;
            y =  (y * canvas.height) || 0;
            width = ( (canvas.width * width) - (width * x) ) || (canvas.width * 1);
            height = ( (canvas.height) * height) - (height * y) || (canvas.height * 1);

            image.data = context.getImageData(x, y, width, height);
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.fillStyle = "rgb(255,255,255)";
            canvas.width =  image.data.width;
            canvas.height = image.data.height;
            context.putImageData(image.data, 0, 0);
            CropImage.callback();
        } catch (err) {
            CropImage.callback(err);
        }
    }
}

module.exports = CropImage;