const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: true
    },
    username: {
        required: true,
        type: String,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    first_name:{
        type:String
    },
    last_name:{
        type: String
    }

},
    // this will help you to know the time a documented was recorded
    { timestamps: true })

const User = mongoose.model("User", userSchema);
module.exports = {User}