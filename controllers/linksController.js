const Link = require('../models/links');

const LocalStorage = require('localStorage');

const Queue = require('../Queue');


exports.searchWord = function (req, res) {
    res.render('links/search');
};

exports.results = async function (req, res) {

    const word = req.body.word;

    if (typeof req.body.search_level !== "undefined") {
        if (LocalStorage.getItem('search_level') !== undefined) {

            console.log('Local storage is', LocalStorage.getItem('search_level'));
            console.log('Value is set');
            LocalStorage.setItem('search_level', req.body.search_level);
            console.log('The page number is', req.params.page);
            const items_per_page = 50;
            LocalStorage.setItem('items_per_page', items_per_page.toString());
            var documents = await Link.find({'document': word});
            LocalStorage.setItem('LevelOne', JSON.stringify(documents[0].links));

            const num_links = documents[0].links.length;
            var num_pages = num_links % items_per_page;
            if (num_links % items_per_page > 0) {
                num_pages += 1;
            }
            LocalStorage.setItem('num_links', num_links.toString());
            LocalStorage.setItem('num_pages', num_pages.toString());
        }
    }

    console.log('Current page is', req.params.page);

    const current_level = LocalStorage.getItem('search_level');

    console.log('Current level is', current_level);

    if (parseInt(current_level) === 1) {
        console.log('The code is in the level');

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

        // res.send('Hello ');

        console.log('THe code reaches the template');
        console.log('The current page is', parseInt(req.params.page));

        res.render('links/show_words', {
            docs: docs,
            num_pages: LocalStorage.getItem('num_pages'),
            items_per_page: LocalStorage.getItem('items_per_page'),
            hasPrev: hasPrev,
            hasNext: hasNext,
            current_page: parseInt(req.params.page)
        });


    } else if (parseInt(current_level) === 2) {
        const documents = await Link.find({'document': word});

        let queue = new Queue();
        let word_map = {};
        let level_two_words = [];
        for (let link of documents[0].links) {
            queue.enqueue(link);
        }

        console.log('Size of Queue is ', queue.getLength());

        while (!queue.isEmpty()) {
            const items = await Link.find({'document': queue.peek()});
            if (typeof items[0] !== "undefined") {
                for (let val of items[0].links) {
                    word_map[val] = queue.peek();
                    level_two_words.push(val);
                }
            }

            queue.dequeue()
        }

        res.render('links/show_words_levelTwo', {
            root: word,
            word_map: word_map,
            documents: level_two_words
        })

    } else if (parseInt(current_level) === 3) {
        const documents = await Link.find({'document': word});

        let queue_LevelOne = new Queue();
        let word_map_levelOne = {};
        let word_map_levelTwo = {};
        let level_three_words = [];
        for (let link of documents[0].links) {
            queue_LevelOne.enqueue(link);
        }

        console.log('Size of Queue 1 is ', queue_LevelOne.getLength());

        let queue_LevelTwo = new Queue();

        while (!queue_LevelOne.isEmpty()) {
            const items = await Link.find({'document': queue_LevelOne.peek()});
            if (typeof items[0] !== "undefined") {
                for (let val of items[0].links) {
                    word_map_levelOne[val] = queue_LevelOne.peek();
                    queue_LevelTwo.enqueue(val);
                }
            }
            queue_LevelOne.dequeue()
        }

        console.log('Size of Queue 2 is ', queue_LevelTwo.getLength());

        while (!queue_LevelTwo.isEmpty()) {

            const items_LevelTwo = await Link.find({'document': queue_LevelTwo.peek()});
            if (typeof items_LevelTwo[0] !== 'undefined') {
                for (let val of items_LevelTwo[0].links) {
                    word_map_levelTwo[val] = queue_LevelTwo.peek();
                    level_three_words.push(val);

                }
            }
            queue_LevelTwo.dequeue();
        }

        console.log('Queue 2 is empty');

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