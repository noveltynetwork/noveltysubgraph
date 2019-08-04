const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose');
const config = require('./config');

console.log(config);

const app = express();

const Paper = require('./models/paper.model');
const Author = require('./models/author.model');

mongoose.connect(config.DB, () => {
    console.log("DB connected");
})

app.get('/papers', async (req, res) => {
    console.log("PAPERS");
    try {
        let papers = await Paper.find({});

        console.log(papers);

        return res.json(papers);

    } catch (e) {
        console.log(e);

        return sendError(res, e);
    }
});

app.get('/papers/:userAddress', async (req, res) => {

    let userAddress = req.params['userAddress'];

    try {
        let papers = await Paper.find({
            author: userAddress
        });

        console.log(papers);

        res.json(papers);

    } catch (e) {
        console.log(e);

        return sendError(res, e);
    }

});

app.get('/users/:userAddress', async (req, res) => {
    try {   

        let address = req.params['userAddress'];

        let author = await Author.findOne({ address: address }).populate('papers votes').exec();
        
        res.json(author);
    } catch(e) {
        sendError(res, e);
    }
});

app.get('/users', async (req, res) => {
    console.log("USERS");
    try {
        let authors = await Author.find({}).populate('papers votes');

        console.log(authors);

        res.json(authors);

    } catch (e) {
        console.log(e);

        return sendError(res, e);
    }
});

function sendError(res, err, status = 400) {
    res.status(status).send(err);
}

app.listen(4000, () => {
    console.log("LISTEN 4000");
});