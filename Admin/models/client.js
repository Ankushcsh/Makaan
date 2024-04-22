const mongoose = require('mongoose')
const clientSchema = new mongoose.Schema({
    cname: {
        type: String
    },
    cprofession:{
        type:String
    },
    cimage:{
        type:String
    },
    cemail:{
        type:String
    },
    cdesc:{
        type:String
    }
   

})

const clientModel = mongoose.model("client", clientSchema)
module.exports = clientModel