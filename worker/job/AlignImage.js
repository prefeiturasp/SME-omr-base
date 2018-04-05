'use strict';
var BaseJob;
BaseJob = require('./_BaseJob');

class AlignImage extends BaseJob {

    /**
     * Run Job Script
     * Makes image alignment, correcting small rotation problems when scanning the image
     * @param canvas {Object} canvas instance
     * @param context {Object} context canvas
     * @param Canvas {Function} canvas class
     * @param jsfeat {Object} jsfeat information
     * @param image {Object} image
     * @param pixelCorners {Object} corners information
     * @callback
     */
    static Run(canvas, context, Canvas, jsfeat, image, pixelCorners) {

        try {

            //temporary canvas
            let canvasTemp = new Canvas(canvas.width, canvas.height);
            let contextTemp = canvasTemp.getContext('2d');
            let cornerTopLeft = {
                x: 0,
                y: 0
            };
            let cornerTopRight = {
                x: 0,
                y: 0
            };
            let radian;
            let registerPointX;
            let registerPointY;
            let centerTemplate;
            let leftCorners = {
                smallerY: canvas.height,
                xSmallerY: 0
            };
            let rightCorners = {
                smallerY: canvas.height,
                xSmallerY: 0
            };

            if(pixelCorners){
                centerTemplate =  pixelCorners.topLeft.x + (pixelCorners.topRight.x -  pixelCorners.topLeft.x) / 2;
            }else{
                centerTemplate = canvas.width * .5;
            }

            //console.log("----------");
            for (let i = 0; i < jsfeat.countCorners; ++i) {

                //left canvas
                if (jsfeat.corners[i].x < centerTemplate) {

                    //find corner smaller y AND get your x
                    if (jsfeat.corners[i].y < leftCorners.smallerY) {
                        leftCorners.smallerY = jsfeat.corners[i].y;
                        leftCorners.xSmallerY = jsfeat.corners[i].x;
                    }

                } else { //right canvas

                    //find corner smaller y AND get your x
                    if (jsfeat.corners[i].y < rightCorners.smallerY) {
                        rightCorners.smallerY = jsfeat.corners[i].y;
                        rightCorners.xSmallerY = jsfeat.corners[i].x;
                    }
                }

            }

            // inclined to right
            if (leftCorners.smallerY < rightCorners.smallerY) {

                cornerTopLeft.x = leftCorners.xSmallerY;
                cornerTopLeft.y = leftCorners.smallerY;
                cornerTopRight.x = rightCorners.xSmallerY;
                cornerTopRight.y = rightCorners.smallerY;
                registerPointX = cornerTopLeft.x;
                registerPointY = cornerTopLeft.y;

            } else { // inclined to left

                cornerTopLeft.x = leftCorners.xSmallerY;
                cornerTopLeft.y = leftCorners.smallerY;
                cornerTopRight.x = rightCorners.xSmallerY;
                cornerTopRight.y = rightCorners.smallerY;
                registerPointX = cornerTopRight.x;
                registerPointY = cornerTopRight.y;
            }



            if(leftCorners.smallerY === rightCorners.smallerY){
                AlignImage.callback();
                return;
            }

            // CENTER //

            // Pointer center template
            // context.fillStyle = "rgba(0, 255, 0, .2)";
            // context.strokeStyle = "rgba(0, 255, 0, .2)";
            // context.beginPath();
            // context.arc(centerTemplate, cornerTopLeft.y, 2, 0, 2 * Math.PI);
            // context.fill();
            // context.stroke();

            //Line center debug
            // context.fillStyle = "rgba(0, 255, 0, .2)";
            // context.strokeStyle = "rgba(0, 255, 0, .2)";
            // context.beginPath();
            // context.moveTo(centerTemplate, 0);
            // context.lineTo(centerTemplate, canvas.height);
            // context.stroke();


            // PIXEL CORNERS //

            //Line top right and left debug
            // context.fillStyle = 'blue';
            // context.strokeStyle = 'red';
            // context.beginPath();
            // context.arc(pixelCorners.topLeft.x, pixelCorners.topLeft.y, 2, 0, 2 * Math.PI);
            // context.arc(pixelCorners.topRight.x, pixelCorners.topRight.y, 2, 0, 2 * Math.PI);
            // context.fill();
            // context.stroke();


            // ROTATE //

            //Line difference rotate debug
            // context.beginPath();
            // context.fillStyle = 'red';
            // context.strokeStyle = 'red';
            // context.moveTo(cornerTopLeft.x, cornerTopLeft.y);
            // context.lineTo(cornerTopRight.x, cornerTopRight.y);
            // context.stroke();

            //Pointers difference rotate debug
            // context.beginPath();
            // context.fillStyle = 'red';
            // context.strokeStyle = 'red';
            // context.arc(cornerTopLeft.x,  cornerTopLeft.y, 2, 0, 2 * Math.PI, false);
            // context.stroke();
            // context.beginPath();
            // context.arc(cornerTopRight.x,  cornerTopRight.y, 2, 0, 2 * Math.PI, false);
            // context.stroke();


            // Calculate distance between two points in radian
            radian = Math.atan2(cornerTopRight.y - cornerTopLeft.y, cornerTopRight.x - cornerTopLeft.x);
            //console.log("radian: " + radian);

            //let degree = radian * (180 / Math.PI);
            // inclined smaller 1 degree
            //if (Math.abs(degree) < 1) {
            //    image.applyRotation = false;
            //    console.log("applyRotation: " + image.applyRotation);
            //    AlignImage.callback();
            //return;
            //} else {
            //    image.applyRotation = true;
            //    console.log("applyRotation: " + image.applyRotation);
            //}

            context.translate(registerPointX, registerPointY);// Move registration point to position found
            contextTemp.rotate(-radian);
            contextTemp.drawImage(canvas, 0, 0, canvas.width, canvas.height);
            context.translate(-registerPointX, -registerPointY);// Move registration point back to the top left corner of canvas

            context.clearRect(0, 0, canvas.width, canvas.height);
            context.fillStyle = "rgb(255,255,255)";
            context.fillRect(0, 0, canvas.width, canvas.height);

            context.drawImage(canvasTemp, 0, 0, canvas.width, canvas.height);
            image.data = context.getImageData(0, 0, canvas.width, canvas.height);

            AlignImage.callback();
        } catch (err) {
            AlignImage.callback(err);
        }
    }
}

module.exports = AlignImage;