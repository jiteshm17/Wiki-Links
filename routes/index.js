const express = require('express');

const Link = require('../models/links');

const router = express.Router();

const links = require('../controllers/linksController');

router.get('/', links.getWords);

router.get('/search', links.searchWord);

router.post('/results/:page', links.results);

router.get('/results/:page', links.results);

router.get('/autocomplete', function (req, res, next) {

    // var regex = new RegExp(req.query["term"]);
    var regex = req.query["term"];
    var linkFinder = Link.find({"$text": {"$search": '\"' + regex + '\"'}}).limit(10);
    // var linkFinder = Link.find({"$text": {"$search": regex}}).limit(10);
    // var linkFinder = Link.find({"$text": {"$search": "\"" + regex + "\""}}).limit(10);


    linkFinder.exec(function (err, data) {
        var result = [];
        if (!err) {
            if (data && data.length && data.length > 0) {
                data.forEach(search_word => {
                    let obj = {
                        id: search_word._id,
                        label: search_word.document
                    };

                    result.push(obj);
                });
            }
            res.jsonp(result);
        }

    });


});


module.exports = router;
