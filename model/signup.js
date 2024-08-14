require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const schema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address.']
    },
    phone: {
        type: String,
        required: true,
        trim: true,
        match: [/^\d{10,15}$/, 'Please enter a valid phone number.']
    },
    age: {
        type: Number,
        required: true,
        min: 0
    },
    password: {
        type: String,
        required: true
    },
    confirmpassword: {
        type: String,
        required: true
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
});

schema.methods.generateauthtoken = async function() {
    try {
        const token = jwt.sign({ _id: this._id.toString() }, process.env.SECRET_KEY);
        this.tokens = this.tokens.concat({ token });
        await this.save();
        return token;
    } catch (error) {
        console.log(`error is ${error}`);
    }
}

schema.pre("save", async function(next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10);
        this.confirmpassword = await bcrypt.hash(this.confirmpassword, 10);
    }
    next();
});

const Registeration = mongoose.model('Registeration', schema);

module.exports = Registeration;
