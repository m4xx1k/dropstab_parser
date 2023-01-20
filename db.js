const db = require('mongoose')
db.set("strictQuery", false);

main().catch(err => console.log(err))

async function main(){// TODO: url
    await db.connect('mongodb+srv://alex12012023:a98lKT7iWGaiShha@alex12012023.nhkqchh.mongodb.net/?retryWrites=true&w=majority')
}

main();

module.exports = db;
