const mongoose = require('mongoose')

const dbConnect = () => {
    const DB_URI = process.env.DB_URI_DEV
     mongoose.connect(DB_URI, { 
         useNewUrlParser: true,
         useUnifiedTopology: true
    }, (err, res) => {
        if (!err) {
            console.log( '**** CONNECTED TO API ****' )
        }
    })
}

module.exports = { dbConnect }
