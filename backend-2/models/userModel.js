const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },

    email: {
        type: String,
        required: true,
        unique: true,
    },

    role: {
        type: String,
        enum: ["user", "admin", "moderator"],
        default: "user",
    },

    isActive: {
        type: Boolean,
        default: true,
    },

    createdAt: {
        type: Date,
        default: Date.now,
    },

    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

userSchema.pre("save", function () {
    this.updatedAt = Date.now(); //Sir wrote the wrong code nex() is problemetic
});

const User = mongoose.model("User", userSchema);

module.exports = User;