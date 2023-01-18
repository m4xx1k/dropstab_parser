const db= require('./db')

const schema = new db.Schema({
    name:{
        type: String,
        required: true
    },
    full_name:{
        type:String,
        required:true
    },
    img:{
        type:String,
        required:true
    },
    price: {
        type: Number,
        required: true
    },
    ath_price: {
        type: Number,
        required: true
    },
    ath_time: {
        type: String,
        required: true
    },
    atl_price: {
        type: Number,
        required: true
    },
    atl_time: {
        type: String,
        required: true
    },
    market_cap: {
        type: Number,
        required: true
    },
    total_supply:{
        type:Number,
        required:true
    }

})

module.exports = db.model('Coin', schema)
