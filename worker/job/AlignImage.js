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
            let leftSmallerCorner = AlignImage.GetSmallerLeftCornerPoint(jsfeat.corners, centerTemplate);
            let rightSmallerCorner = AlignImage.GetSmallerRightCornerPoint(jsfeat.corners, centerTemplate);

            if(leftSmallerCorner.y < rightSmallerCorner.y) {
                cornerTopLeft.x = leftSmallerCorner.x;
                cornerTopLeft.y = leftSmallerCorner.y;
                cornerTopRight.x = rightSmallerCorner.x;
                cornerTopRight.y = rightSmallerCorner.y;
                registerPointX = cornerTopLeft.x;
                registerPointY = cornerTopLeft.y;
            }
            else {
                cornerTopLeft.x = leftSmallerCorner.x;
                cornerTopLeft.y = leftSmallerCorner.y;
                cornerTopRight.x = rightSmallerCorner.x;
                cornerTopRight.y = rightSmallerCorner.y;
                registerPointX = cornerTopRight.x;
                registerPointY = cornerTopRight.y;
            }

            if(leftSmallerCorner.y === rightSmallerCorner.y){
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

    static GetSmallerLeftCornerPoint(corners, centerTemplate) {
        let leftCornersOrdenedByY = corners
            .filter(corner => corner.x < centerTemplate)
            .sort(function (point1, point2) {
                if (point1.y > point2.y) {
                    return 1;
                  }
                  if (point1.y < point2.y) {
                    return -1;
                  }
                  return 0;
            });

        for(var i = 0; i < leftCornersOrdenedByY.length; i++)
        {
            if(AlignImage.CheckPointIsAnOpticalMark(leftCornersOrdenedByY[i], leftCornersOrdenedByY))
                return leftCornersOrdenedByY[i];
        }
    }

    static GetSmallerRightCornerPoint(corners, centerTemplate) {
        let rightCornersOrdenedByY = corners
            .filter(corner => corner.x >= centerTemplate)
            .sort(function (point1, point2) {
                if (point1.y > point2.y) {
                    return 1;
                  }
                  if (point1.y < point2.y) {
                    return -1;
                  }
                  return 0;
            });

        for(var i = 0; i < rightCornersOrdenedByY.length; i++)
        {
            if(AlignImage.CheckPointIsAnOpticalMark(rightCornersOrdenedByY[i], rightCornersOrdenedByY))
                return rightCornersOrdenedByY[i];
        }
    }

    static CheckPointIsAnOpticalMark(point, corners, defaultOpticalMarkWidth, rangeX, rangeY) {
        defaultOpticalMarkWidth = defaultOpticalMarkWidth | 20;
        rangeX = rangeX | 7;
        rangeY = rangeY | 7;

        // Check right side of point
        let referencePointRight = { x: point.x + defaultOpticalMarkWidth, y: point.y };
        let pointsInRangeOfReferencePointRight = corners.filter(corner => 
            corner.x >= referencePointRight.x - rangeX &&
            corner.x <= referencePointRight.x + rangeX &&
            corner.y >= referencePointRight.y - rangeY &&
            corner.y <= referencePointRight.y + rangeY);
        
        if(pointsInRangeOfReferencePointRight.length <= 0) return false;

        // Check bottom side of point
        let referencePointBottom = { x: point.x, y: point.y + defaultOpticalMarkWidth};
        let pointsInRangeOfReferencePointBottom = corners.filter(corner => 
            corner.x >= referencePointBottom.x - rangeX &&
            corner.x <= referencePointBottom.x + rangeX &&
            corner.y >= referencePointBottom.y - rangeY &&
            corner.y <= referencePointBottom.y + rangeY); 

        if(pointsInRangeOfReferencePointBottom.length <= 0) return false;
        return true;
    }
}

module.exports = AlignImage;