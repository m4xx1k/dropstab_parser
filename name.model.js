const db= require('./db')

const schema = new db.Schema({
    name:String

})

module.exports = db.model('Name', schema)
