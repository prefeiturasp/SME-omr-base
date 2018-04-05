'use strict';
var BaseJob;
BaseJob = require('./_BaseJob');

class DetectCorner extends BaseJob {

    /**
     * Run Job Script
     * Detects corners in the image ( tick )
     * @param canvas {Object} canvas
     * @param context {Object} context canvas
     * @param image {Object} image
     * @param jsfeat {Object} jsfeat information
     * @param renderCorners {Boolean=} render corners
     * @param threshold {Number=} threshold corners
     * @callback
     */
    static Run(canvas, context, image, jsfeat, renderCorners, threshold) {

        try {

            //TODO: test threshold
            threshold = threshold || 130;
            //image.data = context.getImageData(0, 0, canvas.width, canvas.height);

            jsfeat.instance.imgproc.grayscale(image.data.data, canvas.width, canvas.height, jsfeat.instance.img_u8);
            jsfeat.instance.imgproc.box_blur_gray(jsfeat.instance.img_u8, jsfeat.instance.img_u8, 2, 0);
            jsfeat.instance.yape06.laplacian_threshold = threshold;
            jsfeat.instance.yape06.min_eigen_value_threshold = threshold;
            jsfeat.countCorners = jsfeat.instance.yape06.detect(jsfeat.instance.img_u8, jsfeat.corners);//returns the number of corners found

            //keeps the corners visible
            if (renderCorners) {
                jsfeat.instance.data_u32 = new Uint32Array(image.data.data.buffer);
                DetectCorner.renderCorners(jsfeat.corners, jsfeat.countCorners, jsfeat.instance.data_u32, canvas.width);
                context.putImageData(image.data, 0, 0);
            }

            DetectCorner.callback();
        } catch (err) {
            DetectCorner.callback(err);
        }
    }

    /**
     * Renders the corners
     * @param corners {Array}
     * @param countCorners {Number}
     * @param image {Object}
     * @param step {Number}
     */
    static renderCorners(corners, countCorners, image, step) {

        var pix = (0xff << 24) | (0x00 << 16) | (0xff << 8) | 0x00,
            x, y, off;

        for (var i = 0; i < countCorners; ++i) {
            x = corners[i].x;
            y = corners[i].y;
            off = (x + y * step);
            image[off] = pix;
            image[off - 1] = pix;
            image[off + 1] = pix;
            image[off - step] = pix;
            image[off + step] = pix;
        }
    }
}

module.exports = DetectCorner;