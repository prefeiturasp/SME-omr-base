'use strict';
var path,
    fs,
    BaseJob,
    Enumerator;

path = require('path');
fs = require('fs');
BaseJob = require('./_BaseJob');
Enumerator = require('../../class/Enumerator');

class EqualizeImage extends BaseJob {

    /**
     * Image Equalization using GraphicMagick lib
     * @see http://aheckmann.github.io/gm/docs.html
     * @param imageMagick {ImageMagick}         Node ImageMagick reference
     * @param filePath {String}                 Input file path
     * @param destDir {String}                  Destination folder
     * @param density {Object}                  Pixel Density
     * @param density.w {Number}                Width
     * @param density.y {Number}                Height
     * @param resize {Object}                   Resize Aspect
     * @param resize.w {Number=}                Width
     * @param resize.h {Number=}                Height
     * @param resize.options {String=}          Options %, @, !, < or >
     * @param bitdepth {Number=}                Bit Depth
     * @param paint {Number=}                   Radius
     * @param enumerator {Enumerator=}          Enumerator Reference
     * @param resizePercentage {Number=}        Resize Percentage
     * @param fileOrganizer (Boolean=}          When true doesn't send error as first param in callback
     */
    static Run(imageMagick, filePath, destDir, density, resize, bitdepth, paint, enumerator, resizePercentage, fileOrganizer) {

        var extName,
            baseName;

        var next = (error, data) => {
            if (fileOrganizer && error) {
                return EqualizeImage.callback(null, error);
            }
            return EqualizeImage.callback(error, data);
        };

        fs.stat(filePath, function (err) {
            if (err) next(err);
            else {
                if (!resize.w && !resize.h) next(new Error('Resize MUST HAVE "width" or "height"'));
                else if (!density.w || !density.h) next(new Error('Density MUST HAVE "width" and "height"'));
                else {
                    Enumerator = enumerator || Enumerator;

                    extName = path.extname(filePath);
                    baseName = path.basename(filePath, extName);

                    if (!Enumerator.FileExtensions._regex.test(extName)) next(new Error('Invalid File Extension'));
                    else {
                        imageMagick(filePath)
                            //.resize(resize.w, resize.h, resize.options)
                            .resize(resizePercentage, "%")
                            //.density(density.w, density.h)
                            //
                            //.trim()
                            //.bitdepth(bitdepth)
                            //.type('Grayscale')
                            //.paint(paint)

                            .write(destDir + "/" + baseName + '.' + Enumerator.FileExtensions.PNG, function (err) {
                                if (err) {
                                    next(err);
                                }
                                else next();
                            });
                    }
                }
            }
        });
    }
}

module.exports = EqualizeImage;