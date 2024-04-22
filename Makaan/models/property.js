const mongoose = require('mongoose')
const propertySchema = new mongoose.Schema({
    Pname: {
        type: String
    },
    ADDRESS: {
        type: String
    },
    size: {
        type: String
    },
    bed: {
        type: Number
    },
    wroom: {
        type: Number
    },
    Price: {
        type: String
    },
    Pdesc: {
        type: String
    },
    image:{
        type:String
    },
    agent:{
        type:String
    },
    catagory:{
        type:String
    },
    types:{
        type:String
    },

})

const propertyModel = mongoose.model("property", propertySchema)
module.exports = propertyModel