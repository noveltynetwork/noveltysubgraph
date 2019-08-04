const mongoose = require('mongoose');

const AuthorSchema = mongoose.Schema({
    address: { type: String, required: true },
    papers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Paper' }],
    tokens: { type: [Number] },
    votes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Paper' }]
})

module.exports = mongoose.model('Author', AuthorSchema);