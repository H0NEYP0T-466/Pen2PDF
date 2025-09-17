const mongoose = require('mongoose');
const { Schema } = mongoose;

const userDataSchema = new Schema({
    todo: { type: String, required: true },
    completed: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

const UserData = mongoose.model('UserData', userDataSchema);

module.exports = UserData;