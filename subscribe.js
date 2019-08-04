const Web3 = require('web3');

const mongoose = require('mongoose');

const Paper = require('./models/paper.model');
const Author = require('./models/author.model');

const { abi: pabi, evm: pevm } = require('/Users/seven/Documents/ethindia/noveltynetwork/build/contracts/Publisher.json');
const { abi: vabi, evm: vevm } = require('/Users/seven/Documents/ethindia/noveltynetwork/build/contracts/NoveltyCoin.json');
const colors = require('colors');

const VoteCoinContractAddress = "0x17d1e03F087707a5Ad8D8C6D43C2B18B36A3eD82";
const PublisherContractAddress = "0xA7C5868344A7fFd1b06e5aB28b25Ca7575907c33";

const web3 = new Web3('ws://localhost:8545')

let Publisher, VoteCoin;

mongoose.connect("mongodb://localhost:27017/noveltycoin").then( async () => {
    console.log("DB Connected");
    Initiate()
}, err => {
    console.log(err);
})

async function Initiate() {
    try {
        Publisher = await new web3.eth.Contract(pabi, PublisherContractAddress);
        VoteCoin = await new web3.eth.Contract(vabi, VoteCoinContractAddress);
        console.log(Publisher.events.PaperPublished);
        // console.log(Publisher)
        subscribe()
    } catch (e) {
        console.log(e);
    }
}

function formPaperObj(paperEvent) {
    return {
        contentHash: paperEvent[0],
        author: paperEvent[1],
        votesInWeight: paperEvent[2]
    }
}

async function subscribe() {

    // a list for saving subscribed event instances
    const subscribedEvents = {}
    // Subscriber method
    const subscribeLogEvent = (contract, eventName, handler) => {
        const eventJsonInterface = web3.utils._.find(
            contract._jsonInterface,
            o => o.name === eventName && o.type === 'event',
        )
        const subscription = web3.eth.subscribe('logs', {
            address: contract.options.address,
            topics: [eventJsonInterface.signature]
        }, (error, result) => {
            if (!error) {
                const eventObj = web3.eth.abi.decodeLog(
                    eventJsonInterface.inputs,
                    result.data,
                    result.topics.slice(1)
                )
                console.log(`New ${eventName}!`, eventObj)

                if (handler) handler(eventObj)
            }
        })
        subscribedEvents[eventName] = subscription
    }

    subscribeLogEvent(Publisher, 'PaperPublished', savePublishedPaper)
    subscribeLogEvent(Publisher, 'Voted', saveNewVote);
}

async function savePublishedPaper(eventObj) {

    let { author, tokenId, contentHash, name, description } = eventObj;

    let paper = new Paper({
        author: author,
        name: name,
        description: description,
        contentHash: contentHash
    });

    try {
        await paper.save()

        let authorModel = await Author.findOne({ address: author });
        
        console.log("AUTHOR".yellow);
        console.log(authorModel);

        // If author is not present in database
        if (!authorModel) {
            await Author.create({
                address: author,
                papers: [paper._id],
                tokens: [tokenId]
            });
        } else {
            await Author.findOneAndUpdate({ address: author }, {
                "$push": { papers: paper._id, tokens: tokenId }
            });
        }

    } catch (e) {
        console.log("ERROR".red);
        console.log(e);
    }
}

async function saveNewVote(votedObj) {
    console.log("ENTERING SAVE NEW NOTE".yellow);
    console.log(votedObj)
    let { voter, _paperHash, votesInWeight } = votedObj;
    try {
        let voterModel = await Author.findOne({ address: voter });

        console.log(voterModel);

        let paper = await Paper.findOne({ contentHash: _paperHash });

        console.log(paper);

        await voterModel.update({ "$push": { votes: paper._id } });

        await paper.update({ votesInWeight: votesInWeight })
    } catch (e) {
        console.log("ERROR IN SAVING NEW VOTE".red);
        console.log(e);
    }
}