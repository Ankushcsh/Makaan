const mongoose = require('mongoose')
const catSchema = new mongoose.Schema({
    cat: {
        type: String
    }
   

})

const catModel = mongoose.model("catdata", catSchema)
module.exports = catModel