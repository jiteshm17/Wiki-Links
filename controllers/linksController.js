const Link = require('../models/links');

const Queue = require('../Queue');

exports.searchWord = function (req, res) {
    res.render('links/search');
};

exports.results = async function (req, res) {

    var level = req.body.search_level;
    const word = req.body.word;
    // console.log(documents);

    if (parseInt(level) === 1) {
        const documents = await Link.find({'document': word});
        res.render('links/show_words', {
            documents: documents
        });


    } else if (parseInt(level) === 2) {
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
            // else {
            //     console.log(queue.peek());
            // }

            queue.dequeue()
        }

        res.render('links/show_words_levelTwo', {
            root: word,
            word_map: word_map,
            documents: level_two_words
        })

    } else if (parseInt(level) === 3) {
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