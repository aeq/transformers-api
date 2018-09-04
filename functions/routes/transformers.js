const express = require('express');
const router = express.Router();

router.get('/transformers', (request, response) => {
    var transformersRef = request.database.ref("transformers").child(request.transformersId);
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
            response.status(400);
            response.send(err.message);
        });
});
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
router.delete('/transformers/:transformerId', (request, response) => {
    return transformersRef = request.database.ref("transformers")
        .child(request.transformersId)
        .child(request.params.transformerId)
        .set(null)
        .then(() => {
            response.status(204);
            response.send();
            return;
        })
        .catch(err => {
            response.status(400);
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