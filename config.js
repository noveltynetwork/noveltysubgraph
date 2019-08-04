const config = {
    "development": {
        "DB": "mongodb://localhost:27017/noveltycoin"
        // "DB": "mongodb://manish:Term!nator@ds259347.mlab.com:59347/noveltycoin"
    },
    "production": {
        "DB": "mongodb://manish:Term!nator@ds259347.mlab.com:59347/noveltycoin"
    }
}

let env = process.env.NODE_ENV || 'development';


module.exports = config[env];