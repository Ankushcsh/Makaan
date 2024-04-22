const mongoose = require('mongoose')
const typeSchema = new mongoose.Schema({
    types: {
        type: String
    }
   

})

const typeModel = mongoose.model("typedata", typeSchema)
module.exports = typeModel