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
    full_name:{
      type:String,
      required:true
    },
    market_cap: {
        type: String,
        required: true
    },
    total_supply:{
        type:String,
        required:true
    },
    c1: {
        type: String,
        required: true
    },
    c2: {
        type: String,
        required: true
    },
    c3: {
        type: String,
        required: true
    },
    c4: {
        type: String,
        required: true
    },
    c5: {
        type: String,
        required: true
    },
    c6: {
        type: String,
        required: true
    },
    c7: {
        type: String,
        required: true
    },
    c8: {
        type: String,
        required: true
    },
    c9: {
        type: String,
        required: true
    },
    c10: {
        type: String,
        required: true
    }

})

module.exports = db.model('Coin', schema)
