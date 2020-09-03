'use strict';
var BaseJob;
BaseJob = require('./_BaseJob');

class FilterResponseCorners extends BaseJob {

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

        try {
            let centerTemplate = canvas.width * .5;
            let topLeftCorner = FilterResponseCorners.GetTopLeftCornerPoint(jsfeat.corners, centerTemplate);
            let bottomLeftCorner = FilterResponseCorners.GetBottomLeftCornerPoint(jsfeat.corners, centerTemplate);
            let topRightCorner = FilterResponseCorners.GetTopRightCornerPoint(jsfeat.corners, centerTemplate);

            // console.log("LEFT TOP   X:" + topLeftCorner.x + "  Y:" + topLeftCorner.y);
            // console.log("LEFT BOTTOM   X:" + bottomLeftCorner.x + "  Y:" + bottomLeftCorner.y);
            // console.log("RIGHT TOP   X:" + topRightCorner.x + "  Y:" + topRightCorner.y);

            let smallerCornerY = topLeftCorner.y > topRightCorner.y ? topRightCorner.y : topLeftCorner.y;
            let biggerCornerY = bottomLeftCorner.y;
            let smallerCornerX = topLeftCorner.x > bottomLeftCorner.x ? bottomLeftCorner.x : topLeftCorner.x;
            let biggerCornerX = topRightCorner.x;

            pixelCorners.topRight.x = biggerCornerX;
            pixelCorners.topRight.y = smallerCornerY;
            pixelCorners.topLeft.x = smallerCornerX;
            pixelCorners.topLeft.y = smallerCornerY;
            pixelCorners.bottomLeft.x = smallerCornerX;
            pixelCorners.bottomLeft.y = biggerCornerY;
            pixelCorners.bottomRight.x = biggerCornerX;
            pixelCorners.bottomRight.y = biggerCornerY;

            let lines = template.columns == 1 ? template.items.length : template.questions;

            pixelCorners.baseWidth = pixelCorners.topRight.x - pixelCorners.topLeft.x;
            pixelCorners.baseHeight = pixelCorners.bottomLeft.y - pixelCorners.topLeft.y;
            pixelCorners.tileWidth = pixelCorners.baseWidth / ( (template.alternatives * template.columns) + ( (offSet.LEFT + offSet.RIGHT) + (template.columns - 1) ) );
            pixelCorners.tileHeight = pixelCorners.baseHeight / ( ( (lines / template.columns) * template.lines ) + ((offSet.TOP + offSet.BOTTOM) + (template.lines - 1) ) );

            pixelCorners.baseX = pixelCorners.topLeft.x + (pixelCorners.tileWidth * offSet.LEFT);
            pixelCorners.baseY = pixelCorners.topLeft.y + (pixelCorners.tileHeight * offSet.TOP);
            pixelCorners.baseWidthWithOffset = pixelCorners.tileWidth * ((template.columns * template.alternatives) + (template.columns - 1));
            pixelCorners.baseHeightWithOffset = pixelCorners.tileHeight * (lines / template.columns);

            FilterResponseCorners.callback();
        } catch (err) {
            FilterResponseCorners.callback(err);
        }
    }

    static GetTopLeftCornerPoint(corners, centerTemplate, defaultOpticalMarkWidth) {
        defaultOpticalMarkWidth = defaultOpticalMarkWidth | 20;
        
        // ORDER BY Y ASC
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
            let referencePointRight = { x: leftCornersOrdenedByY[i].x + defaultOpticalMarkWidth, y: leftCornersOrdenedByY[i].y };
            let referencePointBottom = { x: leftCornersOrdenedByY[i].x, y: leftCornersOrdenedByY[i].y + defaultOpticalMarkWidth };
            
            if(FilterResponseCorners.CheckPointIsAnOpticalMark(leftCornersOrdenedByY[i], leftCornersOrdenedByY, 
                referencePointRight, referencePointBottom))
                return leftCornersOrdenedByY[i];
        }
    }

    static GetBottomLeftCornerPoint(corners, centerTemplate, defaultOpticalMarkWidth) {
        defaultOpticalMarkWidth = defaultOpticalMarkWidth | 20;
        
        // ORDER BY Y DESC
        let leftCornersOrdenedByY = corners
            .filter(corner => corner.x < centerTemplate)
            .sort(function (point1, point2) {
                if (point1.y < point2.y) {
                    return 1;
                  }
                  if (point1.y > point2.y) {
                    return -1;
                  }
                  return 0;
            });

        for(var i = 0; i < leftCornersOrdenedByY.length; i++)
        {
            let referencePointRight = { x: leftCornersOrdenedByY[i].x + defaultOpticalMarkWidth, y: leftCornersOrdenedByY[i].y };
            let referencePointUp = { x: leftCornersOrdenedByY[i].x, y: leftCornersOrdenedByY[i].y - defaultOpticalMarkWidth };
            
            if(FilterResponseCorners.CheckPointIsAnOpticalMark(leftCornersOrdenedByY[i], leftCornersOrdenedByY, 
                referencePointRight, referencePointUp))
                return leftCornersOrdenedByY[i];
        }
    }

    static GetTopRightCornerPoint(corners, centerTemplate, defaultOpticalMarkWidth) {
        defaultOpticalMarkWidth = defaultOpticalMarkWidth | 20;
        
        // ORDER BY Y ASC
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
            let referencePointLeft = { x: rightCornersOrdenedByY[i].x - defaultOpticalMarkWidth, y: rightCornersOrdenedByY[i].y };
            let referencePointBottom = { x: rightCornersOrdenedByY[i].x, y: rightCornersOrdenedByY[i].y + defaultOpticalMarkWidth };

            if(FilterResponseCorners.CheckPointIsAnOpticalMark(rightCornersOrdenedByY[i], rightCornersOrdenedByY,
                referencePointLeft, referencePointBottom))
                return rightCornersOrdenedByY[i];
        }
    }

    static CheckPointIsAnOpticalMark(point, corners, referencePoint1, referencePoint2, rangeX, rangeY) {
        rangeX = rangeX | 7;
        rangeY = rangeY | 7;

        let pointsInRangeOfReferencePoint1 = corners.filter(corner => 
            corner.x >= referencePoint1.x - rangeX &&
            corner.x <= referencePoint1.x + rangeX &&
            corner.y >= referencePoint1.y - rangeY &&
            corner.y <= referencePoint1.y + rangeY);
        
        if(pointsInRangeOfReferencePoint1.length <= 0) return false;

        let pointsInRangeOfReferencePoint2 = corners.filter(corner => 
            corner.x >= referencePoint2.x - rangeX &&
            corner.x <= referencePoint2.x + rangeX &&
            corner.y >= referencePoint2.y - rangeY &&
            corner.y <= referencePoint2.y + rangeY); 

        if(pointsInRangeOfReferencePoint2.length <= 0) return false;
        return true;
    }
}

module.exports = FilterResponseCorners;