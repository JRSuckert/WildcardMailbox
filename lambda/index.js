var AWS = require('aws-sdk');
var s3 = new AWS.S3();
// Create DynamoDB document client
var docClient = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-08-10'});

var bucketName = process.env.BUCKET_NAME;
var domain = process.env.DOMAIN;
 
exports.handler = function(event, context, callback) {
    event.Records.foreach(record => {
        var sesNotification = record.ses;
        const base = sesNotification.mail.destination.filter(address => address.endsWith(`@${domain}`))[0];
        const folder = sesNotification.mail.source;
        const subject = encodeURI(sesNotification.mail.commonHeaders.subject);
        const id = sesNotification.mail.messageId;
        // put id sender, receiver, subject into dynamoDB
        // send notification to user
    });

    
};

function putItem() {
    var params = {
    TableName: process.env.TABLE_NAME,
    Item: {
        'HASHKEY': VALUE,
        'ATTRIBUTE_1': 'STRING_VALUE',
        'ATTRIBUTE_2': VALUE_2
    }
    };

    docClient.put(params, function(err, data) {
    if (err) {
        console.log("Error", err);
    } else {
        console.log("Success", data);
    }
    });
}