const Link = require('../models/links');

const LocalStorage = require('localStorage');

const getLevels = require('../utils/getLevelTwo');

exports.searchWord = function (req, res) {
    res.render('links/search');
};

exports.results = async function (req, res) {

    const word = req.body.word;

    if (typeof req.body.search_level !== "undefined") {

        if (LocalStorage.getItem('search_level') !== undefined) {
            LocalStorage.setItem('search_level', req.body.search_level);
            const items_per_page = 50;
            LocalStorage.setItem('items_per_page', items_per_page.toString());

            var documents = await Link.find({'document': word});

            LocalStorage.setItem('LevelOne', JSON.stringify(documents[0].links));

            const num_links = documents[0].links.length;

            var num_pages = parseInt(num_links / items_per_page);
            if (num_links % items_per_page > 0) {
                num_pages += 1;
            }

            LocalStorage.setItem('num_links', num_links.toString());
            LocalStorage.setItem('num_pages', num_pages.toString());
        }
    }


    const current_level = LocalStorage.getItem('search_level');


    if (parseInt(current_level) === 1) {

        var start_index = (parseInt(req.params.page) - 1) * parseInt(LocalStorage.getItem('items_per_page'));
        var end_index = start_index + parseInt(LocalStorage.getItem('items_per_page'));

        if (end_index >= parseInt(LocalStorage.getItem('num_links'))) {
            end_index = parseInt(LocalStorage.getItem('num_links')) - 1;
        }

        var docs = JSON.parse(LocalStorage.getItem('LevelOne')).slice(start_index, end_index + 1);
        var hasPrev = true;
        var hasNext = true;

        if (parseInt(req.params.page) === 1) {
            hasPrev = false;
        } else if (parseInt(req.params.page) === parseInt(LocalStorage.getItem('num_pages'))) {
            hasNext = false;
        }

        res.render('links/show_words', {
            docs: docs,
            num_pages: LocalStorage.getItem('num_pages'),
            items_per_page: LocalStorage.getItem('items_per_page'),
            hasPrev: hasPrev,
            hasNext: hasNext,
            current_page: parseInt(req.params.page)
        });


    } else if (parseInt(current_level) === 2) {
        const values = await getLevels.getLevelTwoWords(word);

        const level_two_words = values[0];

        const word_map = values[1];
        console.log(level_two_words.length);

        res.render('links/show_words_levelTwo', {
            root: word,
            word_map: word_map,
            documents: level_two_words
        })

    } else if (parseInt(current_level) === 3) {
        const values = await getLevels.getLevelThreeWords(word);
        const word_map_levelOne = values[0];
        const word_map_levelTwo = values[1];
        const level_three_words = values[2];
        res.render('links/show_words_levelThree', {
            root: word,
            word_map_levelOne: word_map_levelOne,
            word_map_levelTwo: word_map_levelTwo,
            documents: level_three_words
        })

    }
};


exports.getWords = async function (req, res) {
    try {
        const documents = await Link.find().limit(10);
        res.render('links/show_words', {
            documents: documents
        });
    } catch (err) {
        console.log(err);
    }
};

exports.getLevel = function (req, res) {
    res.send('This page is for selecting the links');
};