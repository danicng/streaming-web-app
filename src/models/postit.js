const mongoose = require('mongoose');
const { Schema } = mongoose;

const postItSchema = new Schema({
    user: { type: String },
    text: { type: String },
    nameVideo: { type: String },
    currentTime: { type: String },
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('postit', postItSchema);