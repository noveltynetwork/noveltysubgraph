const mongoose = require('mongoose');

const VotingSchema = mongoose.Schema({
    voter: { type: String, required: true },
    paper: { type: String, required: true }
});

module.exports = mongoose.model('Voting', VotingSchema);