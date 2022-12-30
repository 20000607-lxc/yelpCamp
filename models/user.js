const mongoose = require('mongoose')
const passport = require('passport-local-mongoose')

const userSchema = new mongoose.Schema({
    username:{
        type:String, 
        required:true
    },
    password:{
        type:String, 
    },
    email:{ 
        type:String, 
        required:true, 
        unique:true

    }
})

userSchema.plugin(passport);

module.exports = mongoose.model('User', userSchema)