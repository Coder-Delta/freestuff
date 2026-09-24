const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    name:{ type: String, required: true },
    email:{ type: String, required: true, unique: true },
    role:{type:string, default: 'user'},
    createdAt:{ type: Date, default: Date.now },
    
});
module.exports = mongoose.model('User', userSchema);
