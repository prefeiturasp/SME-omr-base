'use strict';
var BaseJob;
BaseJob = require('./_BaseJob');

class DrawImage extends BaseJob{

    /**
     * Run Job Script
     * Draw image on canvas
     * @param canvas {Object} instance Canvas
     * @param context {Object} context Canvas
     * @param instanceImage {Function} instance image Canvas
     * @param image {Image} image
     * @callback
     */
    static Run(canvas, context, instanceImage, image) {

        var insImage, p, w, h;

        try {
            insImage = new instanceImage;
            insImage.src = image.data;

            //resolution
            p = 1; //.7 old value
            w = insImage.width * p;
            h = insImage.height * p;

            canvas.width = w;
            canvas.height = h;
            context.drawImage(insImage, 0, 0, w, h);

	    image.data = context.getImageData(0, 0, w, h);
            
	    DrawImage.callback();
        } catch (err) {
            DrawImage.callback(err);
        }
    }
}

module.exports = DrawImage;
