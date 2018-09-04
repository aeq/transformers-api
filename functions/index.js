const functions = require('firebase-functions');
const admin = require('firebase-admin');
const credentials = require('./service-account-credentials.json');
admin.initializeApp({
    credential: admin.credential.cert(credentials),
    databaseURL: 'https://transformers-api.firebaseio.com'
});

const bodyParser = require('body-parser');
const secret = '****SECRET****';
const jwt = require('jsonwebtoken');

const express = require('express');
const app = express();
app.use(bodyParser.json());
app.use('/transformers', verifyHeaders);
app.use(require('./routes/transformers'));
app.get('/allspark', (request, response) => {
    var db = admin.database();
    var transformersRef = db.ref("transformers");
    var transformersId = transformersRef.push().key;
    var token = jwt.sign({
        transformersId: transformersId
    }, secret);
    response.send(token);
});

function verifyHeaders(request, response, next) {
    if (request.headers.authorization) {
        let headerArgs = request.headers.authorization.split(' ');
        if (headerArgs.length === 2) {
            if (headerArgs[0] === 'Bearer') {
                let decoded = jwt.verify(headerArgs[1], secret);
                request.transformersId = decoded.transformersId;
                request.database = admin.database();
                next();
                return;
            } else {
                response.status(401);
                response.send("Wrong authorization header format.");
            }
        } else {
            response.status(401);
            response.send("Wrong authorization header format.");
        }
    } else {
        response.status(401);
        response.send('Missing authentication header.');
    }
}

exports.app = functions.https.onRequest(app);