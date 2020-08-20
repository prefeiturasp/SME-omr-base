'use strict';
var BaseJob;
BaseJob = require('./_BaseJob');
let fs = require('fs');
let jsfeat = require('jsfeat');
const { loadImage } = require('canvas');

class FindClippingPoint extends BaseJob {
    /**
     * Run Job Script
     * Find the image clipping point
     * @param canvas {Object} canvas
     * @param context {Object} context canvas
     * @param image {Object} image
     * @callback
     */
    static Run(canvas, context, image, Config) {

        let landscapeImage = canvas.width > canvas.height;
        let imgsrc = canvas.toDataURL();
        loadImage(imgsrc)
        .then((insImage) => {
            if(landscapeImage)
                FindClippingPoint.CrossRotate90(context, canvas, insImage, true);

            if(!FindClippingPoint.CheckTopTemplate(
                canvas, 
                context, 
                Config.CropRate.X, 
                Config.CropRate.Y, 
                Config.CropRate.WIDTH,
                Config.CropRate.HEIGHT,
                Config))
            {
                FindClippingPoint.CrossRotate180(context, canvas, insImage);
            }

            image.data = context.getImageData(0, 0, canvas.width, canvas.height);
            FindClippingPoint.callback();
        })
        .catch((error) => {
            FindClippingPoint.callback(error);
        });
    }

    static CrossRotate90(context, canvas, insImage, rotateLeft) {
        let degrees = 90;
        let w = canvas.width;
        let h = canvas.height;

        canvas.width = h;
        canvas.height = w;

        if(rotateLeft)
            degrees = -90;

        context.translate(0, 0);
        context.rotate((degrees * Math.PI) / 180);

        let translateX = rotateLeft ? -w : 0;
        let translateY = !rotateLeft ? -h : 0;
        context.translate(translateX, translateY);
        context.drawImage(insImage, 0, 0, w, h);
        context.save();
    }

    static CrossRotate180(context, canvas, insImage) {
        let w = canvas.width;
        let h = canvas.height;

        context.translate(0, 0);
        context.rotate((180 * Math.PI) / 180);
        context.translate(-h, -w);
        context.drawImage(insImage, 0, 0, h, w);
        context.save();
    }

    static CheckTopTemplate(canvas, context, x, y, width, height, Config) {
        x =  (x * canvas.width) || 0;
        y =  (y * canvas.height) || 0;
        width = ( (canvas.width * width) - (width * x) ) || (canvas.width * 1);
        height = ( (canvas.height) * height) - (height * y) || (canvas.height * 1);

        let topTemplateData = context.getImageData(x, y, width, height);
        let threshold = 180;
        for (let i = 0; i < topTemplateData.data.length; i += 4) {

            if ((topTemplateData.data[i] > threshold) && (topTemplateData.data[i + 1] > threshold) && (topTemplateData.data[i + 2] > threshold)) {
                topTemplateData.data[i] = topTemplateData.data[i + 1] = topTemplateData.data[i + 2] = 255;
            } else {
                topTemplateData.data[i] = topTemplateData.data[i + 1] = topTemplateData.data[i + 2] = 0;
            }
        }

        threshold = 130
        jsfeat.img_u8 = new jsfeat.matrix_t(topTemplateData.width, topTemplateData.height, jsfeat.U8_t | jsfeat.C1_t);
        jsfeat.imgproc.grayscale(topTemplateData.data, topTemplateData.width, topTemplateData.height, jsfeat.img_u8);
        jsfeat.imgproc.box_blur_gray(jsfeat.img_u8, jsfeat.img_u8, 2, 0);
        jsfeat.yape06.laplacian_threshold = threshold;
        jsfeat.yape06.min_eigen_value_threshold = threshold;

        var corners = [];
        let i = topTemplateData.width * topTemplateData.height;
        while (--i >= 0) {
            corners[i] = new jsfeat.keypoint_t(0, 0, 0, 0);
        }

        let countCorners = jsfeat.yape06.detect(jsfeat.img_u8, corners);
        if(countCorners > 0) return true;
        return false;
    }
}

module.exports = FindClippingPoint;