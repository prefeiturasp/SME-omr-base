'use strict';
var BaseJob;
BaseJob = require('./_BaseJob');

class DrawGrid extends BaseJob {

    /**
     * Run Job Script
     * Draws a grid on the canvas according to the corners of the properties found
     * @param context {Object} context canvas
     * @param pixelCorners {Object} corners information
     * @param template {Object} template information
     * @callback
     */
    static Run(context, pixelCorners, template) {

        if (pixelCorners.baseWidth < 1 || pixelCorners.baseHeight < 1 || pixelCorners.tileWidth < 1 || pixelCorners.tileHeight < 1){
            DrawGrid.callback();
            return;
        }

        try {

            //context.beginPath();
            //context.arc(pixelCorners.topLeft.x, pixelCorners.topLeft.y, 2, 0, 2 * Math.PI, false);
            //context.stroke();
            //
            //context.beginPath();
            //context.arc(pixelCorners.topRight.x, pixelCorners.topRight.y, 2, 0, 2 * Math.PI, false);
            //context.stroke();

            context.fillStyle = 'red';
            context.strokeStyle = 'red';
            context.beginPath();
            context.arc(pixelCorners.topLeft.x, pixelCorners.topLeft.y, 2, 0, 2 * Math.PI);
            context.arc(pixelCorners.topRight.x, pixelCorners.topRight.y, 2, 0, 2 * Math.PI);
            //context.arc(pixelCorners.bottomLeft.x, pixelCorners.bottomLeft.y, 2, 0, 2 * Math.PI);
            //context.arc(pixelCorners.bottomRight.x, pixelCorners.bottomRight.y, 2, 0, 2 * Math.PI);
            context.fill();
            context.stroke();

            context.fillStyle = "rgba(0, 255, 0, .2)";
            context.strokeStyle = "rgba(0, 255, 0, .2)";

            context.beginPath();
            context.moveTo(pixelCorners.topLeft.x, pixelCorners.topLeft.y);
            context.lineTo(pixelCorners.topRight.x, pixelCorners.topRight.y);
            context.stroke();

            context.beginPath();
            context.moveTo(pixelCorners.topRight.x, pixelCorners.topRight.y);
            context.lineTo(pixelCorners.bottomRight.x, pixelCorners.bottomRight.y);
            context.stroke();

            context.beginPath();
            context.moveTo(pixelCorners.bottomRight.x, pixelCorners.bottomRight.y);
            context.lineTo(pixelCorners.bottomLeft.x, pixelCorners.bottomLeft.y);
            context.stroke();

            context.beginPath();
            context.moveTo(pixelCorners.bottomLeft.x, pixelCorners.bottomLeft.y);
            context.lineTo(pixelCorners.topLeft.x, pixelCorners.topLeft.y);
            context.stroke();

            //columns
            for (let x = pixelCorners.baseX; x <= pixelCorners.topRight.x; x += pixelCorners.tileWidth) {

                //columns
                context.beginPath();
                context.moveTo(x, pixelCorners.baseY);
                context.lineTo(x, pixelCorners.bottomLeft.y);
                context.stroke();
            }

            //rows
            for (let y = pixelCorners.baseY; y <= pixelCorners.bottomLeft.y; y += pixelCorners.tileHeight) {

                // rows
                context.beginPath();
                context.moveTo(pixelCorners.baseX, y);
                context.lineTo(pixelCorners.topRight.x - pixelCorners.tileWidth, y);
                context.stroke();
            }

            DrawGrid.callback();
        } catch (err) {
            DrawGrid.callback(err);
        }
    }
}

module.exports = DrawGrid;