const Queue = require('../Queue');

const Link = require('../models/links');

exports.getLevelOneWords = async function (word) {
    const documents = await Link.find({'document': word});
    return documents[0].links;

};

exports.getLevelTwoWords = async function (word) {
    const documents = await Link.find({'document': word});
    let queue = new Queue();
    let wordExists = new Map();
    let word_map = {};
    let level_two_words = [];
    for (let link of documents[0].links) {
        if (wordExists.has(link)) {
            continue;
        } else {
            wordExists.set(link, 1);
            queue.enqueue(link);
        }
    }


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

    return [level_two_words, word_map];

};

exports.getLevelThreeWords = async function (word) {
    const documents = await Link.find({'document': word});

    let queue_LevelOne = new Queue();
    let word_map_levelOne = {};
    let word_map_levelTwo = {};
    let level_three_words = [];

    let wordExistsLevelOne = new Map();
    let wordExistsLevelTwo = new Map();

    for (let link of documents[0].links) {
        if (wordExistsLevelOne.has(link)) {
            continue;
        } else {
            wordExistsLevelOne.set(link, 1);
            queue_LevelOne.enqueue(link);
        }

    }

    let queue_LevelTwo = new Queue();

    while (!queue_LevelOne.isEmpty()) {
        const items = await Link.find({'document': queue_LevelOne.peek()});
        if (typeof items[0] !== "undefined") {
            for (let val of items[0].links) {
                word_map_levelOne[val] = queue_LevelOne.peek();
                if (wordExistsLevelTwo.has(val)) {
                    continue;
                } else {
                    wordExistsLevelTwo.set(val, 1);
                    queue_LevelTwo.enqueue(val);
                }
            }
        }
        queue_LevelOne.dequeue()
    }

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

    return [word_map_levelOne, word_map_levelTwo, level_three_words]

};