const mongoose = require('mongoose');
const { Schema } = mongoose;

const roomSchema = new Schema({
    name: { type: String },
    type: { type: String },
    password: { type: String },
    createdBy: { type: String },
    stateCreator: {type: Boolean},
    video: {type: String},
    messages: [String]
});

module.exports = mongoose.model('room', roomSchema);