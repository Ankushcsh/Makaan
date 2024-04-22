const mongoose = require('mongoose')
const BlogSchema = new mongoose.Schema({
    Blog: {
        type: String,
       
    }

})
    const reactblogModel = mongoose.model("reactBlogs",  BlogSchema )
    module.exports = reactblogModel