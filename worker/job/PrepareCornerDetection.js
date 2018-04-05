'use strict';
var BaseJob;
BaseJob = require('./_BaseJob');

class PrepareCornerDetection extends BaseJob {

    /**
     * Run Job Script
     * Prepares for the detection of corners in the picture
     * @param canvas {Object} canvas
     * @param jsfeat {Object} jsfeat information
     * @param image {Object} image
     * @callback
     */
    static Run(canvas, jsfeat, image) {

        var i;
        try {
            i = canvas.width * canvas.height;

            jsfeat.instance.img_u8 = new jsfeat.instance.matrix_t(canvas.width, canvas.height, jsfeat.instance.U8_t | jsfeat.instance.C1_t);

            while (--i >= 0) {
                jsfeat.corners[i] = new jsfeat.instance.keypoint_t(0, 0, 0, 0);
                // this.corners[i] = {x: 0, y:0, score:0, level:0};
            }
            PrepareCornerDetection.callback();
        } catch (err) {
            PrepareCornerDetection.callback(err);
        }
    }
}

module.exports = PrepareCornerDetection;