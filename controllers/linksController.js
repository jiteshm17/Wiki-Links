const Link = require('../models/links');

const LocalStorage = require('localStorage');

const getLevels = require('../utils/getLevelWords');

exports.searchWord = function (req, res) {
    res.render('links/search');
};

exports.results = async function (req, res) {

    const word = req.body.word;
    if (typeof req.body.search_level !== "undefined") {
        LocalStorage.setItem('search_level', req.body.search_level);
        if (LocalStorage.getItem('search_level') !== undefined) {
            var current_level = LocalStorage.getItem('search_level');
            if (LocalStorage.getItem('word') !== undefined) {
                LocalStorage.removeItem('word');
            }
            LocalStorage.setItem('word', word);
            const items_per_page = 50;
            LocalStorage.setItem('items_per_page', items_per_page.toString());

        }
    }

    var current_level = LocalStorage.getItem('search_level')
    if (parseInt(current_level) === 1) {
        console.log('Getting docs');
        console.log('Word:',LocalStorage.getItem('word'));
        docs = await getLevels.getLevelOneWords(LocalStorage.getItem('word'),req.params.page);
        docs = JSON.parse(docs)
        console.log('Got docs');
        console.log('docs:',docs);
        console.log('current_page:',req.params.page);
        res.render('links/show_words', {
            docs: docs[0],
            num_pages: LocalStorage.getItem('num_pages'),
            items_per_page: LocalStorage.getItem('items_per_page'),
            hasPrev: docs[1],
            hasNext: docs[2],
            current_page: parseInt(req.params.page)
        });


    } else if (parseInt(current_level) === 2) {
        console.log('Getting docs');
        console.log('Word:',LocalStorage.getItem('word'));
        docs = await getLevels.getLevelTwoWords(LocalStorage.getItem('word'),req.params.page);
        console.log('Got docs');
        docs = JSON.parse(docs);
        console.log('docs:',docs);
        console.log('current_page:',req.params.page);
        res.render('links/show_words_levelTwo', {
            root: LocalStorage.getItem('word'),
            word_map: docs[1],
            documents: docs[0],
            hasPrev: docs[2],
            hasNext: docs[3],
            current_page: parseInt(req.params.page)
        })

    } else if (parseInt(current_level) === 3) {
        console.log('Getting docs');
        console.log('Word:',LocalStorage.getItem('word'));
        docs = await getLevels.getLevelThreeWords(LocalStorage.getItem('word'),req.params.page);
        console.log('Got docs');
        docs = JSON.parse(docs);
        console.log('docs:',docs);
        console.log('current_page:',req.params.page);
        res.render('links/show_words_levelThree', {
            root: LocalStorage.getItem('word'),
            word_map_levelOne: docs[1],
            word_map_levelTwo: docs[2],
            documents: docs[0],
            hasPrev: docs[3],
            hasNext: docs[4],
            current_page: parseInt(req.params.page)
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
