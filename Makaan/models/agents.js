const mongoose = require('mongoose')
const agentSchema = new mongoose.Schema({
    name: {
        type: String
    },
    email: {
        type: String
    },
    fb: {
        type: String
    },
    insta: {
        type: String
    },
    tweet: {
        type: String
    },
    img: {
        type: String
    },
    password:{
        type:String
    },
    role:{
        type:String
    }
   
   

})

const agentModel = mongoose.model("agentdata", agentSchema)
module.exports = agentModel