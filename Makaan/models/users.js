const mongoose = require('mongoose')
const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    username: {
        type: String,
        required:true
    },
    Phonenumber: {
        type: Number,
        required:true
    },
    img:{
        type:String
    }

    
   

})

const UserModel = mongoose.model("usersssss", UserSchema)
module.exports =  UserModel