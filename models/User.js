const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    id: String,
    name: String,
    komentar: Array,
}, {
    timestamps: true
});

module.exports = mongoose.model("user", UserSchema);