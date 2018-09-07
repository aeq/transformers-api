const express = require('express');
const router = express.Router();

/**
 * @typedef Transformer
 * @property {integer} id - Uniquely generated ID.
 * @property {string} name - Transformer name.
 * @property {string} team - Transformer team, either "A" or "D" (Autobot or Decepticon).
 * @property {integer} strength - Strength value, must be between 1 and 10.
 * @property {integer} intelligence - Intelligence value, must be between 1 and 10.
 * @property {integer} speed - Speed value, must be between 1 and 10.
 * @property {integer} endurance - Endurance value, must be between 1 and 10.
 * @property {integer} rank - Rank value, must be between 1 and 10.
 * @property {integer} courage - Courage value, must be between 1 and 10.
 * @property {integer} firepower - Firepower value, must be between 1 and 10.
 * @property {integer} skill - Skill value, must be between 1 and 10.
 * @property {string} team_icon - An image URL that represents what team the Transformer is on.
 */

/**
 * @typedef Transformers
 * @property {Array.<Transformer>} transformers - A list of Transformers.
 */

/**
 * @typedef TransformerRequest
 * @property {integer} id - Only needed for PUT requests and must be valid. Will be ignored for POST requests.
 * @property {string} name.required - Transformer name.
 * @property {string} team.required - Transformer team, either "A" or "D" (Autobot or Decepticon).
 * @property {integer} strength.required - Strength value, must be between 1 and 10.
 * @property {integer} intelligence.required - Intelligence value, must be between 1 and 10.
 * @property {integer} speed.required - Speed value, must be between 1 and 10.
 * @property {integer} endurance.required - Endurance value, must be between 1 and 10.
 * @property {integer} rank.required - Rank value, must be between 1 and 10.
 * @property {integer} courage.required - Courage value, must be between 1 and 10.
 * @property {integer} firepower.required - Firepower value, must be between 1 and 10.
 * @property {integer} skill.required - Skill value, must be between 1 and 10.
 */

/**
 * Gets a list of the Transformers created using the POST API. Returns a maximum list of 50 Transformers starting from the oldest created Transformer.
 * @route GET /transformers
 * @group transformers - Operations on Transformers
 * @produces application/json
 * @returns {Transformers.model} 200 - An object containing a list of Transformers.
 * @returns {Error}  default - Unexpected error
 * @headers {string} 200.Authorization - Authorization header with the value "Bearer <token>", where <token> is the retrieved token from the /allspark API. 
 * @security JWT
 */
router.get('/transformers', (request, response) => {
    var transformersRef = request.database.ref("transformers").child(request.transformersId);
    transformersRef.limitToLast(50).once("value")
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
            response.status(400);
            response.send(err.message);
        });
});
/**
 * Gets a Transformer based on a valid ID.
 * @route GET /transformers/{transformerId}
 * @group transformers - Operations on Transformers
 * @produces application/json
 * @param {string} transformerId.path.required - ID of the Transformer to retrieve.
 * @returns {Transformers.model} 200 - An object containing a list of Transformers.
 * @returns {Error}  401 - Transformer not found.
 * @headers {string} 200.Authorization - Authorization header with the value "Bearer <token>", where <token> is the retrieved token from the /allspark API. 
 * @security JWT
 */
router.get('/transformers/:transformerId', (request, response) => {
    return request.database.ref("transformers")
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
            response.status(400);
            response.send(err.message);
        });
});
/**
 * Creates a Transformer with the provided data in the request body (in JSON). Note that the “overall rating” is not returned.
 * @route POST /transformers
 * @group transformers - Operations on Transformers
 * @consumes application/json
 * @produces application/json
 * @param {TransformerRequest.model} transformer.body.required - The request body representing the Transformer to be created.
 * @returns {Transformer.model} 201 - The created Transformer object.
 * @returns {Error}  default - Unexpected error
 * @headers {string} 200.Authorization - Authorization header with the value "Bearer <token>", where <token> is the retrieved token from the /allspark API. 
 * @security JWT
 */
router.post('/transformers', (request, response) => {
    validateAndCreateTransformer(request, response, transformer => {
        var transformersRef = request.database.ref("transformers").child(request.transformersId);
        var transformerRef = transformersRef.push();
        transformer.id = transformerRef.key;
        transformerRef.set(transformer)
            .then(() => {
                response.status(201);
                response.json(transformer);
                return;
            })
            .catch(err => {
                response.status(400);
                response.send(err.message);
            });
    });
});
/**
 * Updates an existing Transformer with the provided data in the request body, the Transformer ID must be valid.
 * @route PUT /transformers
 * @group transformers - Operations on Transformers
 * @param {TransformerRequest.model} transformer.body.required - The request body representing the Transformer to be created.
 * @returns {Transformer.model} 200 - The updated Transformer object.
 * @returns {Error}  default - Unexpected error
 * @headers {string} 200.Authorization - Authorization header with the value "Bearer <token>", where <token> is the retrieved token from the /allspark API. 
 * @security JWT
 */
router.put('/transformers', (request, response) => {
    validateAndCreateTransformer(request, response, transformer => {
        if (request.body.id) {
            transformer.id = request.body.id;
            var transformerRef = request.database.ref("transformers")
                .child(request.transformersId)
                .child(transformer.id);
            transformerRef.once("value")
                .then(data => {
                    if (data.val()) {
                        return transformerRef.set(transformer);
                    } else {
                        throw new Error("Transformer does not exist.");
                    }
                })
                .then(() => {
                    response.json(transformer);
                    return;
                })
                .catch(err => {
                    response.status(400);
                    response.send(err.message);
                });
        } else {
            response.status(400);
            response.send('Missing Transformer ID.');
        }
    });
});
/**
 * Deletes a Transformer based on the transformer ID passed in.
 * @route DELETE /transformers/{transformerId}
 * @group transformers - Operations on Transformers
 * @produces application/json
 * @param {string} transformerId.path.required - ID of the Transformer to delete.
 * @returns {string} 204 - An object containing a list of Transformers.
 * @returns {Error}  401 - Transformer not found.
 * @headers {string} 200.Authorization - Authorization header with the value "Bearer <token>", where <token> is the retrieved token from the /allspark API. 
 * @security JWT
 */
router.delete('/transformers/:transformerId', (request, response) => {
    var transformerRef = request.database.ref("transformers")
        .child(request.transformersId)
        .child(request.params.transformerId);
    transformerRef.once("value")
        .then(data => {
            if (data.val()) {
                return transformerRef.set(null);
            } else {
                throw new Error("Transformer does not exist.");
            }
        })
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

function validateAndCreateTransformer(request, response, next) {
    if (!request.body) {
        response.status(400);
        response.send('Empty request body.');
        return;
    }
    if (!request.body.name || request.body.name === "") {
        response.status(400);
        response.send('Invalid Transformer name.');
        return;
    } else if (!request.body.team || (request.body.team !== "A" && request.body.team !== "D")) {
        response.status(400);
        response.send('Invalid Transformer team (Should be either \'A\' or \'D)\'.');
        return;
    } else if (!request.body.strength || request.body.strength < 1 || request.body.strength > 10) {
        response.status(400);
        response.send('Invalid strength score (Should be between 1 and 10).');
        return;
    } else if (!request.body.intelligence || request.body.intelligence < 1 || request.body.intelligence > 10) {
        response.status(400);
        response.send('Invalid intelligence score (Should be between 1 and 10).');
        return;
    } else if (!request.body.speed || request.body.speed < 1 || request.body.speed > 10) {
        response.status(400);
        response.send('Invalid speed score (Should be between 1 and 10).');
        return;
    } else if (!request.body.endurance || request.body.endurance < 1 || request.body.endurance > 10) {
        response.status(400);
        response.send('Invalid endurance score (Should be between 1 and 10).');
        return;
    } else if (!request.body.rank || request.body.rank < 1 || request.body.rank > 10) {
        response.status(400);
        response.send('Invalid rank score (Should be between 1 and 10).');
        return;
    } else if (!request.body.courage || request.body.courage < 1 || request.body.courage > 10) {
        response.status(400);
        response.send('Invalid courage score (Should be between 1 and 10).');
        return;
    } else if (!request.body.firepower || request.body.firepower < 1 || request.body.firepower > 10) {
        response.status(400);
        response.send('Invalid firepower score (Should be between 1 and 10).');
        return;
    } else if (!request.body.skill || request.body.skill < 1 || request.body.skill > 10) {
        response.status(400);
        response.send('Invalid skill score (Should be between 1 and 10).');
        return;
    }
    var transformer = {
        name: request.body.name,
        team: request.body.team,
        strength: request.body.strength,
        intelligence: request.body.intelligence,
        speed: request.body.speed,
        endurance: request.body.endurance,
        rank: request.body.rank,
        courage: request.body.courage,
        firepower: request.body.firepower,
        skill: request.body.skill
    };
    if (transformer.team === "A") {
        transformer.team_icon = "https://tfwiki.net/mediawiki/images2/archive/f/fe/20110410191732%21Symbol_autobot_reg.png";
    } else if (transformer.team === "D") {
        transformer.team_icon = "https://tfwiki.net/mediawiki/images2/archive/8/8d/20110410191659%21Symbol_decept_reg.png";
    }
    next(transformer);
}

module.exports = router;