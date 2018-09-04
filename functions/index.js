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
app.use('/transformers', (request, response, next) => {
    // Verify header contents.
    if (request.headers.authorization) {
        let headerArgs = request.headers.authorization.split(' ');
        if (headerArgs.length === 2) {
            if (headerArgs[0] === 'Bearer') {
                let decoded = jwt.verify(headerArgs[1], secret);
                request.transformersId = decoded.transformersId;
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
});
app.get('/transformers', (request, response) => {
    var db = admin.database();
    var transformersRef = db.ref("transformers").child(request.transformersId);
    transformersRef.limitToLast(10).once("value")
        .then(snapshot => {
            if (snapshot === null) {
                response.json({});
            } else {
                var transformersResponse = {};
                transformersResponse.transformers = [];
                snapshot.forEach(data => {
                    let transformer = data.val();
                    transformer.id = data.key;
                    transformersResponse.transformers.push(transformer);
                });
                response.json(transformersResponse);
            }
            return;
        })
        .catch(err => {
            response.status(401);
            response.send(err.message);
        });
});
app.get('/transformers/:transformerId', (request, response) => {
    var db = admin.database();
    return db.ref("transformers")
        .child(request.transformersId)
        .child(request.params.transformerId)
        .once("value")
        .then(data => {
            if (data.val()) {
                let transformer = data.val();
                transformer.id = data.key;
                response.json(transformer);
            } else {
                response.status(404);
                response.send('Transformer not found.');
            }
            return;
        })
        .catch(err => {
            response.status(401);
            response.send(err.message);
        });
});
app.post('/transformers', (request, response) => {
    if (request.body === null) {
        response.status(400);
        response.send('Empty request body.');
        return;
    }
    let transformer = request.body;
    if (transformer.name === null || transformer.name === '') {
        response.status(400);
        response.send('Invalid Transformer name.');
        return;
    } else if (transformer.team === null || (transformer.team !== "A" && transformer.team !== "D")) {
        response.status(400);
        response.send('Invalid Transformer team (Should be either \'A\' or \'D)\'.');
        return;
    } else if (transformer.strength === null || transformer.strength < 1 || transformer.strength > 10) {
        response.status(400);
        response.send('Invalid strength score (Should be between 1 and 10).');
        return;
    } else if (transformer.intelligence === null || transformer.intelligence < 1 || transformer.intelligence > 10) {
        response.status(400);
        response.send('Invalid intelligence score (Should be between 1 and 10).');
        return;
    } else if (transformer.speed === null || transformer.speed < 1 || transformer.speed > 10) {
        response.status(400);
        response.send('Invalid speed score (Should be between 1 and 10).');
        return;
    } else if (transformer.endurance === null || transformer.endurance < 1 || transformer.endurance > 10) {
        response.status(400);
        response.send('Invalid endurance score (Should be between 1 and 10).');
        return;
    } else if (transformer.rank === null || transformer.rank < 1 || transformer.rank > 10) {
        response.status(400);
        response.send('Invalid rank score (Should be between 1 and 10).');
        return;
    } else if (transformer.courage === null || transformer.courage < 1 || transformer.courage > 10) {
        response.status(400);
        response.send('Invalid courage score (Should be between 1 and 10).');
        return;
    } else if (transformer.firepower === null || transformer.firepower < 1 || transformer.firepower > 10) {
        response.status(400);
        response.send('Invalid firepower score (Should be between 1 and 10).');
        return;
    } else if (transformer.skill === null || transformer.skill < 1 || transformer.skill > 10) {
        response.status(400);
        response.send('Invalid skill score (Should be between 1 and 10).');
        return;
    }

    var db = admin.database();
    var transformersRef = db.ref("transformers").child(request.transformersId);
    var transformerRef = transformersRef.push();
    transformer.id = transformerRef.key;
    transformerRef.set(transformer)
        .then(() => {
            response.json(transformer);
            return;
        })
        .catch(err => {
            response.status(401);
            response.send(err.message);
        });
});
app.delete('/transformers/:transformerId', (request, response) => {
    var db = admin.database();
    return transformersRef = db.ref("transformers")
        .child(request.transformersId)
        .child(request.params.transformerId)
        .set(null)
        .then(() => {
            response.status(204);
            response.send();
            return;
        })
        .catch(err => {
            response.status(401);
            response.send(err.message);
        });
});
app.get('/allspark', (request, response) => {
    var db = admin.database();
    var transformersRef = db.ref("transformers");
    var transformersId = transformersRef.push().key;
    var token = jwt.sign({
        transformersId: transformersId
    }, secret);
    response.send(token);
});


exports.app = functions.https.onRequest(app);