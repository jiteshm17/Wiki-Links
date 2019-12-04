const Links = require('../models/links');

const Queue = require('../Queue');

exports.searchWord = function (req, res) {
    res.render('links/search');
};

exports.results = async function (req, res) {
    var level = req.body.search_level;
    console.log(level);
    const word = req.body.word;
    console.log(word);

    const documents = await Links.find({'document': word});

    if (parseInt(level) === 1) {
        res.render('links/show_words', {
            documents: documents
        });


    } else if (parseInt(level) === 2) {
        let queue = new Queue();
        let word_map = {};
        let level_two_words = [];
        for (let link of documents) {
            queue.enqueue(link);
        }

        while (!queue.isEmpty()) {
            const items = await Links.find({'document': queue.peek()});
            for (let val of items) {
                word_map[val] = queue.peek();
                level_two_words.push(val);
            }
            queue.dequeue()
        }

        render('')

    }

    // else if(parseInt(level) === 3){
    //     // render a view
    // }
};

exports.getWords = async function (req, res) {
    try {
        const documents = await Links.find().limit(10);
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