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
            const current_level = LocalStorage.getItem('search_level');
            if (LocalStorage.getItem('word') !== undefined) {
                LocalStorage.removeItem('word');
            }
            LocalStorage.setItem('word', word);
            const items_per_page = 50;
            LocalStorage.setItem('items_per_page', items_per_page.toString());

            if (parseInt(current_level) === 1) {
                var level_one_words = await getLevels.getLevelOneWords(word);
                if (LocalStorage.getItem('LevelDocs') !== undefined) {
                    LocalStorage.removeItem('LevelDocs');
                }
                LocalStorage.setItem('LevelDocs', JSON.stringify(level_one_words));

            } else if (parseInt(current_level) === 2) {
                var l2 = await getLevels.getLevelTwoWords(word);
                if (LocalStorage.getItem('LevelDocs') !== undefined) {
                    LocalStorage.removeItem('LevelDocs');
                }

                if (LocalStorage.getItem('word_map') !== undefined) {
                    LocalStorage.removeItem('word_map');
                }
                LocalStorage.setItem('LevelDocs', JSON.stringify(l2[0]));
                LocalStorage.setItem('word_map', JSON.stringify(l2[1]));


            } else if (parseInt(current_level) === 3) {
                var l3 = await getLevels.getLevelThreeWords(word);
                if (LocalStorage.getItem('LevelDocs') !== undefined) {
                    LocalStorage.removeItem('LevelDocs');
                }
                if (LocalStorage.getItem('word_map_levelOne') !== undefined) {
                    LocalStorage.removeItem('word_map_levelOne');
                }
                if (LocalStorage.getItem('word_map_levelTwo') !== undefined) {
                    LocalStorage.removeItem('word_map_levelTwo');
                }
                console.log('Saving links...');
                LocalStorage.setItem('LevelDocs', JSON.stringify(l3[2]));
                console.log('Saved links');
                LocalStorage.setItem('word_map_levelOne', JSON.stringify(l3[0]));
                LocalStorage.setItem('word_map_levelTwo', JSON.stringify(l3[1]));

            }
            const num_links = parseInt(JSON.parse(LocalStorage.getItem('LevelDocs')).length);
            var num_pages = parseInt(num_links / items_per_page);
            if (num_links % items_per_page > 0) {
                num_pages += 1;
            }
            if (LocalStorage.getItem('num_links') !== undefined) {
                LocalStorage.removeItem('num_links');
            }
            if (LocalStorage.getItem('num_pages') !== undefined) {
                LocalStorage.removeItem('num_pages');
            }
            LocalStorage.setItem('num_links', num_links.toString());
            LocalStorage.setItem('num_pages', num_pages.toString());
        }
    }
    var current_level = LocalStorage.getItem('search_level');

    var start_index = (parseInt(req.params.page) - 1) * parseInt(LocalStorage.getItem('items_per_page'));
    var end_index = start_index + parseInt(LocalStorage.getItem('items_per_page'));

    if (end_index >= parseInt(LocalStorage.getItem('num_links'))) {
        end_index = parseInt(LocalStorage.getItem('num_links')) - 1;
    }

    var docs = JSON.parse(LocalStorage.getItem('LevelDocs')).slice(start_index, end_index + 1);

    var hasPrev = true;
    var hasNext = true;

    if (parseInt(req.params.page) === 1) {
        hasPrev = false;
    } else if (parseInt(req.params.page) === parseInt(LocalStorage.getItem('num_pages'))) {
        hasNext = false;
    }
    if (parseInt(current_level) === 1) {
        res.render('links/show_words', {
            root: LocalStorage.getItem('word'),
            docs: docs,
            num_pages: LocalStorage.getItem('num_pages'),
            items_per_page: LocalStorage.getItem('items_per_page'),
            hasPrev: hasPrev,
            hasNext: hasNext,
            current_page: parseInt(req.params.page)
        });


    } else if (parseInt(current_level) === 2) {
        res.render('links/show_words_levelTwo', {
            root: LocalStorage.getItem('word'),
            word_map: JSON.parse(LocalStorage.getItem('word_map')),
            documents: docs,
            hasPrev: hasPrev,
            hasNext: hasNext,
            current_page: parseInt(req.params.page)
        })

    } else if (parseInt(current_level) === 3) {

        res.render('links/show_words_levelThree', {
            root: LocalStorage.getItem('word'),
            word_map_levelOne: JSON.parse(LocalStorage.getItem('word_map_levelOne')),
            word_map_levelTwo: JSON.parse(LocalStorage.getItem('word_map_levelTwo')),
            documents: docs,
            hasPrev: hasPrev,
            hasNext: hasNext,
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