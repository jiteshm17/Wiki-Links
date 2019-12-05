var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var LinksSchema = new Schema(
    {
        document: {type: String},
        links: [{type: String}],

    }
);

module.exports = mongoose.model('Link', LinksSchema);
