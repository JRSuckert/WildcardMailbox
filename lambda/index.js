var AWS = require('aws-sdk');
var s3 = new AWS.S3();
 
var bucketName = 'mail-leswile.de';
 
exports.handler = function(event, context, callback) {
    var sesNotification = event.Records[0].ses;
    console.log("SES Notification:\n", JSON.stringify(sesNotification, null, 2));
    const base = sesNotification.mail.destination.filter(address => address.endsWith("@leswile.de"))[0]
    const folder = sesNotification.mail.source;
    const subject = encodeURI(sesNotification.mail.commonHeaders.subject);
    const id = sesNotification.mail.messageId;
    var params = {
        Bucket: bucketName, 
        CopySource: "/mail-leswile.de/"+id, 
        Key: base + "/" + folder + "/" + subject + "-" + id + ".eml"
    };
    s3.copyObject(params, function(err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else {
            var params = {
                Bucket: bucketName, 
                Key: id
            };
            s3.deleteObject(params, function(err, data) {
                if (err) console.log(err, err.stack); // an error occurred
                else     console.log(data);           // successful response
            });
        }
    });
};