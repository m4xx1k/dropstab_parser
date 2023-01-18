const db= require('./db')

const schema = new db.Schema({
    name:{
        type: String,
        required: true
    },
    img:{
        type:String,
        required:true
    },
    price: {
        type: String,
        required: true
    },
    ath_price: {
        type: String,
        required: true
    },
    ath_time: {
        type: String,
        required: true
    },
    atl_price: {
        type: String,
        required: true
    },
    atl_time: {
        type: String,
        required: true
    },
    market_cap: {
        type: String,
        required: true
    },
    total_supply:{
        type:String,
        required:true
    }

})

module.exports = db.model('Coin', schema)
