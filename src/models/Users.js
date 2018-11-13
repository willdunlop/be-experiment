const mongoose = require('mongoose');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const UsersSchema = new mongoose.Schema({
    email: String,
    hash: String,
    salt: String,
});

/**
 * @function setPassword()
 * @param {String} password - the password submitted by the user
 * Will turn the password submitted by the user into an encrypted hash. This hash is made further secure through 
 * the use of a salt which applies a randomness to the cryptography, preventing predictable hashes and dettering 
 * bruteforce attacks 
 */
UsersSchema.methods.setPassword = function (password) {
    this.salt = crypto.randomBytes(16).toString('hex');
    this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
}

/**
 * @function validatePassword()
 * @param {String} password - the password submitted by the user
 * applies the cryptographic algorithm, including the salt, to a user submitted password in order to validate a login
 */
UsersSchema.methods.validatePassword = function (password) {
    const hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
    return this.hash === hash;
};


UsersSchema.methods.generateJWT = function() {
    const today = new Date();
    const expirationDate = new Date(today);
    expirationDate.setDate(today.getDate() + 60);

    return jwt.sign({
        email: this.email,
        id: this._id,
        exp: parseInt(expirationDate.getTime() / 1000, 10),
    }, 'secret');
}

UsersSchema.methods.toAuthJSON = function() {
    const json = {
        _id: this._id,
        email: this.email,
        token: this.generateJWT()
    };

    return json;
};


mongoose.model("Users", UsersSchema);