const mongoose = require('mongoose')
const ReactsignupSchema = new mongoose.Schema({
    fname: {
        type: String,
       
    },
    lname: {
        type: String,
       
    },
    email:{
        type:String,
       
    },
    password:{
        type:String,
       
    },
    gender:{
        type:String,
       
    },
    designation:{
        type:String,
       
    },
    img:{
        type:String,
       
    }
   

    
   

})

const reactsignupModel = mongoose.model("reactsignups", ReactsignupSchema )
module.exports =  reactsignupModel