const Link = require('../models/links');

const LocalStorage = require('localStorage');

function storeTillEnd(links, start, end, phrase) {
    // console.log('in store till end [start,end]', start, ',', end);
    const limit = parseInt(LocalStorage.getItem('items_per_page'));
    LocalStorage.removeItem('LevelOneLinks');
    var links_length = links.length;
    var flag = false;
    var hasPrevious = true;
    var hasNext = true;
    var remainingLinksLength = 0
    for (var i = start; i <= end; i++) {
        if (i == 1) {
            hasPrevious = false
        }
        if (i * limit < links_length) {
            LocalStorage.setItem(phrase + i.toString(), JSON.stringify([links.slice((i - 1) * limit, (i * limit) - 1), hasPrevious, hasNext]));
        } else {
            LocalStorage.setItem(phrase + i.toString(), JSON.stringify([links.slice((i - 1) * limit), hasPrevious, false]));
            LocalStorage.setItem(phrase + 'Links', JSON.stringify(links.slice(links_length)));
            LocalStorage.setItem(phrase + 'LastPage', i.toString());
            flag = true;
            break;
        }
    }
    if (flag === false) {
        remainingLinksLength = links.slice(end * limit).length;
        LocalStorage.setItem(phrase + 'Links', JSON.stringify(links.slice(end * limit)));
        LocalStorage.setItem(phrase + 'LastPage', end.toString());
    }
    if (LocalStorage.getItem(phrase + end.toString()) === undefined) {
        return ['Page doesn\'t exists', false, false];
    }
    // console.log(end, hasPrevious);
    return LocalStorage.getItem(phrase + end.toString());
}


async function levelTwoUtils(word, start, end) {
    const limit = parseInt(LocalStorage.getItem('items_per_page'));
    var term;
    // console.log('in level two utils[start,end]', start, ',', end);
    var links = JSON.parse(LocalStorage.getItem('levelTwolinks'));
    // console.log(links);
    if (links === null) {
        // console.log('links undefined');
        var documents = await Link.find({'document': word});
        while (typeof documents[0] !== "undefined" && documents[0].redirect !== undefined) {
            documents = await Link.find({'document': documents[0].redirect});
        }
        links = documents[0].links
    }

    var hasNext = false;
    var hasPrev = true;
    // console.log('got links in utils');
    while (start <= end && links.length > 0) {
        // console.log('in while');
        hasNext = false;
        hasPrev = true;
        var items = await Link.find({'document': links[links.length - 1]});
        if (typeof items[0] !== "undefined") {
            while (typeof items[0] !== "undefined" && items[0].redirect !== undefined) {
                items = await Link.find({'document': items[0].redirect});
            }
        }
        term = links[links.length - 1];
        links.pop();
        if (links.length > 1) {
            hasNext = true;
        }
        if (start == 1) {
            hasPrev = false;
        }
        if (items[0].links.length > limit) {
            LocalStorage.setItem('levelTwo' + start.toString(), JSON.stringify([items[0].links.slice(0, limit - 1), term, hasPrev, hasNext]));
            if (start == end) {
                // console.log('returning ...');
                LocalStorage.setItem('levelTwolinks', JSON.stringify(links));
                LocalStorage.setItem('levelTwoLastPage', start.toString())
                return JSON.stringify([items[0].links.slice(0, limit - 1), term, hasPrev, hasNext]);
            }
        } else {
            LocalStorage.setItem('levelTwo' + start.toString(), JSON.stringify([items[0].links, term, hasPrev, hasNext]));
            if (start == end) {
                // console.log('returning ...');
                LocalStorage.setItem('levelTwolinks', JSON.stringify(links));
                LocalStorage.setItem('levelTwoLastPage', start.toString())
                return JSON.stringify([items[0].links, term, hasPrev, hasNext]);
            }
        }
        start = start + 1
    }
}


async function levelThreeUtils(word, start, end) {
    const limit = parseInt(LocalStorage.getItem('items_per_page'));
    var term;
    // console.log('in level three utils[start,end]', start, ',', end);
    var links_1 = JSON.parse(LocalStorage.getItem('levelThreelinks_1'));
    var links_2;
    var term_1;
    var term_2;
    // console.log(links_1);
    var flag = false;
    if (links_1 === null) {
        // console.log('links are null');
        var documents = await Link.find({'document': word});
        while (typeof documents[0] !== "undefined" && documents[0].redirect !== undefined) {
            documents = await Link.find({'document': documents[0].redirect});
        }
        links_1 = documents[0].links;
        term_1 = links_1[links_1.length - 1];
        links_1.pop();

        var items = await Link.find({'document': term_1});
        if (typeof items[0] !== "undefined") {
            while (typeof items[0] !== "undefined" && items[0].redirect !== undefined) {
                items = await Link.find({'document': items[0].redirect});
            }
        }

        links_2 = items[0].links;

        flag = true
    }
    if (flag === false) {
        links_2 = JSON.parse(LocalStorage.getItem('levelThreelinks_2'));
        term_1 = LocalStorage.getItem('levelThreeTerm_1');
    }

    var hasPrev = true;
    var hasNext = true;
    // console.log('got links in utils');
    while (start <= end) {
        // console.log('in while');
        if (links_2.length == 0) {
            term_1 = links_1[links_1.length - 1];
            links_1.pop();
            items = await Link.find({'document': term_1});
            if (typeof items[0] !== "undefined") {
                while (typeof items[0] !== "undefined" && items[0].redirect !== undefined) {
                    items = await Link.find({'document': items[0].redirect});
                }
            }
            links_2 = items[0].links
        }

        term_2 = links_2[links_2.length - 1];
        links_2.pop();
        items = await Link.find({'document': term_2});
        if (typeof items[0] !== "undefined") {
            while (typeof items[0] !== "undefined" && items[0].redirect !== undefined) {
                items = await Link.find({'document': items[0].redirect});
            }
        }
        hasPrev = true;
        hasNext = true;
        if (start == 1) {
            hasPrev = false
        }
        if (links_1.length > 0) {
            hasNext = true
        }
        if (items[0].links.length > limit) {
            LocalStorage.setItem('levelThree' + start.toString(), JSON.stringify([items[0].links.slice(0, limit - 1), term_1, term_2, hasPrev, hasNext]))
        } else {
            LocalStorage.setItem('levelThree' + start.toString(), JSON.stringify([items[0].links, term_1, term_2, hasPrev, hasNext]))
        }
        if (start == end) {

            if (links_2.length == 0) {
                term_1 = links_1[links_1.length - 1]
                links_1.pop()
                items = await Link.find({'document': term_1});
                if (typeof items[0] !== "undefined") {
                    while (typeof items[0] !== "undefined" && items[0].redirect !== undefined) {
                        items = await Link.find({'document': items[0].redirect});
                    }
                }
                links_2 = items[0].links
            }
            LocalStorage.setItem('levelThreelinks_2', JSON.stringify(links_2));
            LocalStorage.setItem('levelThreeTerm_1', term_1);
            LocalStorage.setItem('levelThreelinks_1', JSON.stringify(links_1));
            LocalStorage.setItem('levelThreeLastPage', end.toString())
            return LocalStorage.getItem('levelThree' + start.toString());
        }
        start = start + 1;
    }


}


exports.getLevelOneWords = async function (word, page) {
    // console.log('in getlevelone');
    var levelOneWord = LocalStorage.getItem('levelOneWord');
    // console.log(levelOneWord);
    // console.log('word,page in function:', word, ', ', page);
    const limit = parseInt(LocalStorage.getItem('items_per_page'));
    if (levelOneWord !== null && levelOneWord !== word) {
        // console.log('word doesnt match');
        LocalStorage.removeItem('levelOneWord');
        var index = 1;
        while (LocalStorage.getItem('levelOne' + index.toString()) !== null) {
            LocalStorage.removeItem('levelOne' + index.toString());
            index = index + 1
        }
        if (LocalStorage.getItem('levelOneLastPage') !== null) {
            LocalStorage.removeItem('levelOneLastPage')
        }
        if (LocalStorage.getItem('levelOneLinks') !== null) {
            LocalStorage.removeItem('levelOneLinks')
        }
        levelOneWord = null;
    }
    if (levelOneWord === null) {
        // console.log('word is null');
        LocalStorage.setItem('levelOneWord', word);
        var documents = await Link.find({'document': word});
        while (typeof documents[0] !== "undefined" && documents[0].redirect !== undefined) {
            documents = await Link.find({'document': documents[0].redirect});
        }
        // console.log('got all links');
        var links = documents[0].links;
        return storeTillEnd(links, 1, page, 'LevelOne')

    } else if (levelOneWord === word) {
        // console.log('word matches');
        // console.log(LocalStorage.getItem('LevelOneLinks'));
        var links = JSON.parse(LocalStorage.getItem('LevelOneLinks'));
        var links_length = links.length;
        var hasNext = true;
        var hasPrevious = true;
        // console.log(limit);

        var lastpage = JSON.parse(LocalStorage.getItem('LevelOneLastPage'));
        // console.log('lastpage:', lastpage);
        if (lastpage >= page) {
            return LocalStorage.getItem('LevelOne' + page.toString());
        }
        return storeTillEnd(links, lastpage + 1, page, 'LevelOne');
    }

};


exports.getLevelTwoWords = async function (word, page) {
    // console.log('in getleveltwo');
    var levelTwoWord = LocalStorage.getItem('levelTwoWord');
    // console.log(levelTwoWord);
    // console.log('word,page in function:', word, ', ', page);
    const limit = parseInt(LocalStorage.getItem('items_per_page'));
    if (levelTwoWord !== null && levelTwoWord !== word) {
        // console.log('word doesnt match');
        LocalStorage.removeItem('levelTwoWord');
        var index = 1;
        while (LocalStorage.getItem('levelTwo' + index.toString()) !== null) {
            LocalStorage.removeItem('levelTwo' + index.toString())
            index = index + 1
        }
        if (LocalStorage.getItem('levelTwoLastPage') !== null) {
            LocalStorage.removeItem('levelTwoLastPage')
        }
        if (LocalStorage.getItem('levelTwolinks') !== null) {
            LocalStorage.removeItem('levelTwolinks')
        }
        levelTwoWord = null;
    }
    if (levelTwoWord === null) {
        // console.log('word is null');
        LocalStorage.setItem('levelTwoWord', word);
        return levelTwoUtils(word, 1, page)
    } else if (levelTwoWord === word) {
        // console.log('word equal');
        if (LocalStorage.getItem('levelTwo' + page.toString()) !== null) {
            return LocalStorage.getItem('levelTwo' + page.toString());
        }
        // console.log('GOING to utils');
        var lastpage = parseInt(LocalStorage.getItem('levelTwoLastPage'));
        // console.log('lastpage:', lastpage);
        return levelTwoUtils(word, lastpage + 1, page);
    }

};

exports.getLevelThreeWords = async function (word, page) {
    // console.log('in getlevelthree');
    var levelThreeWord = LocalStorage.getItem('levelThreeWord');
    // console.log(levelThreeWord);
    // console.log('word,page in function:', word, ', ', page);
    const limit = parseInt(LocalStorage.getItem('items_per_page'));
    if (levelThreeWord !== null && levelThreeWord !== word) {
        // console.log('word doesnt match');
        LocalStorage.removeItem('levelThreeWord');
        var index = 1;
        while (LocalStorage.getItem('levelThree' + index.toString()) !== null) {
            LocalStorage.removeItem('levelThree' + index.toString())
            index = index + 1
        }
        if (LocalStorage.getItem('levelThreeLastPage') !== null) {
            LocalStorage.removeItem('levelThreeLastPage')
        }
        if (LocalStorage.getItem('levelThreelinks_1') !== null) {
            LocalStorage.removeItem('levelThreelinks_1')
        }
        if (LocalStorage.getItem('levelThreelinks_2') !== null) {
            LocalStorage.removeItem('levelThreelinks_2')
        }
        if (LocalStorage.getItem('levelThreeTerm_1') !== null) {
            LocalStorage.removeItem('levelThreeTerm_1')
        }
        levelThreeWord = null;
    }
    if (levelThreeWord === null) {
        // console.log('word is null');
        LocalStorage.setItem('levelThreeWord', word);

        return levelThreeUtils(word, 1, page)

    } else if (levelThreeWord === word) {
        // console.log('word equal');
        if (LocalStorage.getItem('levelThree' + page.toString()) !== null) {
            return LocalStorage.getItem('levelThree' + page.toString());
        }
        // console.log('GOING to utils');
        var lastpage = parseInt(LocalStorage.getItem('levelThreeLastPage'));
        // console.log('lastpage:', lastpage);
        return levelThreeUtils(word, lastpage + 1, page);
    }

};
