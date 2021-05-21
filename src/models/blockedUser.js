const mongoose = require('mongoose');
const { Schema } = mongoose;

const blockedUserSchema = new Schema({
    user: { type: String },
    room: { type: String }
});

module.exports = mongoose.model('blockedUser', blockedUserSchema);