'use strict';
var BaseJob;
BaseJob = require('./_BaseJob');

class DetectQRCode extends BaseJob{

    /**
     * Configure Job
     * @param _callback         {Function}      Callback Function
     */
    static Config(_callback) {
        DetectQRCode.callback = _callback;
    }

    /**
     * Run Job Script
     * QRCode reader
     * @param imagePath {String}
     * @param QRCode {Object} QRCode library reference
     * @param exam {Object} Exam reference
     * @param template {String=} Test_Id value from template
     * @param tryHarder {Boolean=} Try again if can't decode QRCode at the first time
     * @callback
     */
    static Run(imagePath, QRCode, exam, template, tryHarder) {

        QRCode.decode(imagePath, tryHarder)
            .then((decoded) => {
                try {
                    let data = JSON.parse(decoded);

                    //TODO: Remove the HARD CODED properties validation
                    if (data.hasOwnProperty('Test_Id') && data.hasOwnProperty('Section_Id') &&
                        data.hasOwnProperty('Student_Id') && data.hasOwnProperty('School_Id')) {
                        exam.owner = data;
                        if (template) {
                            if (data['Test_Id'] == template) {
                                DetectQRCode.callback();
                            } else {
                                let error = new Error(`QRCode "Test_Id" is "${data['Test_Id']}" and "Template.externalId" is "${template}"`);
                                error.type = 'DetectQRCode';
                                DetectQRCode.callback(error);
                            }
                        } else {
                            exam.owner = data;
                            DetectQRCode.callback();
                        }
                    } else {
                        let error = new Error(`QRCode decoded data doesn't have "Test_Id", "Section_Id", "Student_Id" OR "School_Id". Decoded data ${JSON.stringify(decoded)}`);
                        error.type = 'DetectQRCode';
                        DetectQRCode.callback(error);
                    }
                } catch (error) {
                    DetectQRCode.callback(error);
                }
            })
            .catch((error) => {
                DetectQRCode.callback(error);
            });
    }
}

module.exports = DetectQRCode;