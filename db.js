const db = require('mongoose')
db.set("strictQuery", false);

main().catch(err => console.log(err))

async function main(){// TODO: url
    await db.connect('mongodb+srv://admin:admin@cluster0.wiumf7i.mongodb.net/?retryWrites=true&w=majority')
}

main();

module.exports = db;
