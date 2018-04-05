'use strict';
var BaseClient = require('./_BaseSIAClient'),
    Enumerator;

class PostBatchResult extends BaseClient {

    /**
     * PostBatchResult
     * @param Config                {Object=}   Config Class
     * @param enumerator           {Object=}   Enumerator Class
     * @constructor
     */
    constructor(Config, enumerator) {
        Enumerator = enumerator;
        super(`${Config.Connector.SIA.SUBFOLDER}/api/answersheet/postbatchresult`, Config);
    }

    /**
     * Send File Log
     * @param aggregationExternalId {Number}    Aggregation External ID
     * @param templateExternalId    {Number}    Template External ID
     * @param groupExternalId       {Number}    Group External ID, if Template.qrCode is true, this is provide by qrCode Data
     * @param studentObjectList     {Array}     Student Object List, Use PostBatchResult.BuildStudentObject
     * @param token
     * @return {Promise}
     */
    SendResult(aggregationExternalId, templateExternalId, groupExternalId, studentObjectList, token) {
        return new Promise((resolve, reject) => {
            var data;
            this.SetHeaders({
                'Content-Type': 'application/json',
                'Authorization': token
            });

            data = {
                Batch_Id: aggregationExternalId,
                Test_Id: templateExternalId,
                Section_Id: groupExternalId,
                Students: studentObjectList
            };

            this.Post(data)
                .then(resolve, reject);
        });
    }

    /**
     *
     * @param fileId                {Number}    File Id
     * @param itemObjectList        {Array}     Item Object List, Use PostBatchResult.BuildItemObject
     * @param externalId            {Number=}    Student External ID
     * @param studentNumber         {String=}   Student Number in Class Room, Used in Manual Identification
     * @param absent                {Boolean=}
     * @return {Object}
     * @static
     */
    static BuildStudentObject(fileId, itemObjectList, externalId, studentNumber, absent) {
        var res ={
            File_Id: fileId,
            Items: itemObjectList
        };

        if (absent) res["Absent"] = true;

        if (studentNumber) res['NumberId'] = studentNumber;
        else res['Id'] = externalId;

        return res;
    }

    /**
     * Build User Object
     * @param itemId                {Number}    Item ID
     * @param answerId              {Number}    Answer Id
     * @param state                 {Number}    Question State (Enumerator.ExamQuestionState)
     * @return {Object}
     * @static
     */
    static BuildItemObject(itemId, answerId, state) {
        var res = {
            Id: itemId
        };

        if (state == Enumerator.ExamQuestionState.NULL) res['EmptyAlternative'] = true;
        else if (state == Enumerator.ExamQuestionState.ERASED) res['DuplicateAlternative'] = true;
        else res['AlternativeId'] = answerId;

        return res;
    }
}

module.exports = PostBatchResult;