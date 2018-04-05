'use strict';
var BaseJob;
BaseJob = require('./_BaseJob');

class FilterCorner extends BaseJob {

    /**
     * Run Job Script
     * Filters all the corners ( x and y) was found to get the desired
     * @param canvas {Object} canvas
     * @param jsfeat {Object} jsfeat information
     * @param pixelCorners {Object} corners information
     * @param template {Object} template information
     * @param offSet {Object} template offSet
     * @callback
     */
    static Run(canvas, jsfeat, pixelCorners, template, offSet) {

        let smallerCornerX,
            biggerCornerX,
            smallerCornerY,
            biggerCornerY;

        try {
            smallerCornerX = canvas.width;
            biggerCornerX = 0;
            smallerCornerY = canvas.height;
            biggerCornerY = 0;

            for (let i = 0; i < jsfeat.countCorners; i++) {

                //find corner smaller y
                if (jsfeat.corners[i].y < smallerCornerY) {
                    smallerCornerY = jsfeat.corners[i].y;
                }

                //find corner bigger Y
                if (jsfeat.corners[i].y > biggerCornerY) {
                    biggerCornerY = jsfeat.corners[i].y;
                }

                //find corner smaller X
                if (jsfeat.corners[i].x < smallerCornerX) {
                    smallerCornerX = jsfeat.corners[i].x;
                }

                //find corner bigger X
                if (jsfeat.corners[i].x > biggerCornerX) {
                    biggerCornerX = jsfeat.corners[i].x;
                }
            }

            pixelCorners.topRight.x = biggerCornerX;
            pixelCorners.topRight.y = smallerCornerY;
            pixelCorners.topLeft.x = smallerCornerX;
            pixelCorners.topLeft.y = smallerCornerY;
            pixelCorners.bottomLeft.x = smallerCornerX;
            pixelCorners.bottomLeft.y = biggerCornerY;
            pixelCorners.bottomRight.x = biggerCornerX;
            pixelCorners.bottomRight.y = biggerCornerY;

            //var context = canvas.getContext("2d");
            //context.fillStyle = 'red';
            //context.strokeStyle = 'red';
            //context.beginPath();
            //context.arc(pixelCorners.topRight.x, pixelCorners.topRight.y, 2, 0, 2 * Math.PI, false);
            //context.stroke();
            //context.beginPath();
            //context.arc(pixelCorners.topLeft.x, pixelCorners.topLeft.y, 2, 0, 2 * Math.PI, false);
            //context.stroke();

            //todo: review validation number of questions
            let lines = template.columns == 1 ? template.items.length : template.questions;

            pixelCorners.baseWidth = pixelCorners.topRight.x - pixelCorners.topLeft.x;
            pixelCorners.baseHeight = pixelCorners.bottomLeft.y - pixelCorners.topLeft.y;
            pixelCorners.tileWidth = pixelCorners.baseWidth / ( (template.alternatives * template.columns) + ( (offSet.LEFT + offSet.RIGHT) + (template.columns - 1) ) );
            pixelCorners.tileHeight = pixelCorners.baseHeight / ( ( (lines / template.columns) * template.lines ) + ((offSet.TOP + offSet.BOTTOM) + (template.lines - 1) ) );

            pixelCorners.baseX = pixelCorners.topLeft.x + (pixelCorners.tileWidth * offSet.LEFT);
            pixelCorners.baseY = pixelCorners.topLeft.y + (pixelCorners.tileHeight * offSet.TOP);
            pixelCorners.baseWidthWithOffset = pixelCorners.tileWidth * ((template.columns * template.alternatives) + (template.columns - 1));
            pixelCorners.baseHeightWithOffset = pixelCorners.tileHeight * (lines / template.columns);

            FilterCorner.callback();
        } catch (err) {
            FilterCorner.callback(err);
        }
    }
}

module.exports = FilterCorner;