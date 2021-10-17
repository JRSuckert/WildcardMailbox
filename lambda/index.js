var AWS = require('aws-sdk');
var s3 = new AWS.S3();
var ddb = new AWS.DynamoDB.DocumentClient();
 
var bucketName = 'mail-leswile.de';
 
exports.handler = function(event, context, callback) {
    if(!Array.isArray(event.Records) || event.Records.length === 0) {
        return;
    }
    
    for(let record of event.Records) {
        if(record.eventSource !== "aws:ses") {
            return;
        }
        console.log('Process email');
        console.log("SES Notification:\n", JSON.stringify(record));
        var sesNotification = record.ses;
        const base = sesNotification.mail.destination.filter(address => 
            address.endsWith("@leswile.de"))[0];
        const folder = sesNotification.mail.source;
        const subjectEncoded = encodeURI(sesNotification.mail.commonHeaders.subject);
        const id = sesNotification.mail.messageId;
        const key = base + "/" + folder + "/" + subjectEncoded + "-" + id + ".eml";

        var params = {
            Bucket: bucketName, 
            CopySource: "/mail-leswile.de/"+id, 
            Key: key
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
        
        const timestamp = Date.parse(sesNotification.mail.timestamp);
        const headers = sesNotification.mail.headers;
        const recipient = headers.find(header => header.name === "To");
        const sender = headers.find(header => header.name === "From");
        const subject = headers.find(header => header.name === "Subject");
        
        if(id && timestamp && recipient && sender && subject && key) {
            ddb.put({
                Item: {
                    uuid: id,
                    date: timestamp,
                    recipient: recipient.value,
                    sender: sender.value,
                    subject: subject.value,
                    key
                },
                TableName: "mail-leswile.de",
            }).promise()
            .then(data => console.log(data.Attributes))
            .catch(console.error);
        }
    }
    
};