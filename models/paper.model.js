const mongoose = require('mongoose')

const PaperSchema = mongoose.Schema({
    name: String,
    description: String,
    contentHash: { type: String },
    author: { type: String },
    votesInWeight: { type: Number, default: 1 }
});

module.exports = mongoose.model('Paper', PaperSchema);