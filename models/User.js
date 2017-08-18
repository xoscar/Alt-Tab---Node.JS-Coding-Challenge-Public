// dependencies
const mongoose = require('mongoose');
const uuid = require('uuid-v4');

// libs
const encryptString = require('../common/utils').encryptString;
const compareToEncryptedString = require('../common/utils').compareToEncryptedString;
const auth = require('../common/auth');

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  token: String,
});

userSchema.pre('save', function preSave(next) {
  if (this.isNew) {
    return Promise

      .all([
        encryptString(uuid()),
        encryptString(this.password),
      ])

      .then(([token, password]) => {
        this.token = token;
        this.password = password;
        next();
      });
  }

  return next();
});

userSchema.methods.getInfo = function getInfo() {
  return {
    email: this.email,
  };
};

userSchema.statics.login = function login(body) {
  const requiredKeys = 'email password'.split(' ');
  if (requiredKeys.filter(key => !body[key])[0]) {
    return Promise.reject(400);
  }

  return new Promise((resolve, reject) => (
    this.findOne({
      email: body.email,
    }, (err, user) => {
      if (err || !user) {
        return reject(401);
      }

      return compareToEncryptedString(user.password, body.password)

        .then(() => (
          auth.generateJwt({
            email: user.email,
            token: user.token,
            timestamp: Date.now(),
          })

          .then(token => (
            resolve(Object.assign(user.getInfo(), {
              token,
            }))
          ))
        ), () => (
          reject(401)
        ))

        .catch(() => (
          reject(500)
        ));
    })
  ));
};

userSchema.statics.validateToken = function validateToken(body) {
  return new Promise((resolve, reject) => (
    this.findOne({
      email: body.email,
    }, (err, user) => {
      if (err || !user) {
        return reject(401);
      }

      return compareToEncryptedString(user.token, body.token)

        .then(() => (
          resolve(user)
        ), () => (
          reject(401)
        ));
    })
  ));
};

userSchema.statics.create = function create(body) {
  const requiredKeys = 'email password'.split(' ');

  if (requiredKeys.filter(key => !body[key])[0]) {
    return Promise.reject(400);
  }

  return new Promise((resolve, reject) => (
    this.findOne({ email: body.email }, (err, user) => {
      if (err || user) {
        return reject(400);
      }

      const newUser = new this({
        email: body.email,
        password: body.password,
      });

      return newUser.save(() => (
        resolve(newUser)
      ));
    })
  ));
};

module.exports = mongoose.model('users', userSchema);
