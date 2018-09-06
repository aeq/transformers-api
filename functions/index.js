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
const expressSwagger = require('express-swagger-generator')(app);

let options = {
    swaggerDefinition: {
        info: {
            description: 'A simple CRUD API to handle Transformers.',
            title: 'Transformers API',
            version: '1.0.0',
        },
        host: 'transformers-api.firebaseapp.com',
        basePath: '/',
        produces: [
            "application/json"
        ],
        schemes: ['https'],
        securityDefinitions: {
            JWT: {
                type: 'apiKey',
                in: 'header',
                name: 'Authorization'
            }
        }
    },
    basedir: __dirname, //app absolute path
    files: ['./routes/**/*.js', './*.js'] //Path to the API handle folder
};
expressSwagger(options);

app.use(bodyParser.json());
app.use('/transformers', verifyHeaders);
app.use(require('./routes/transformers'));

/**
 * Returns a token that should be cached accordingly. For each subsequent requests to any of the '/transformers’ endpoints, the token must be attached to the request’s header. All data saved/retrieved from those endpoints will be unique to the attached token.
 * @route GET /allspark
 * @group allspark - Retrieve an AllSpark token.
 * @returns {string} 200 - A JWT token to be attached to the header of all requests to the /transformers endpoints.
 * @returns {Error}  default - Unexpected error
 */
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