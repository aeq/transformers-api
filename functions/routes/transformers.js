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
    validateTransformer(request, response, () => {
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
    validateTransformer(request, response, transformer => {
        if (transformer.id) {
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

function validateTransformer(request, response, next) {
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
    next(transformer);
}

module.exports = router;