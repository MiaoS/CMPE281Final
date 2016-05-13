/**
 * Created by dansu on 5/2/16.
 */
var mongoose = require('mongoose');

module.exports = mongoose.model('User',{
    id:String,
    username: String,
    password: String,
    email: String,
    firstname: String,
    lastname: String
});