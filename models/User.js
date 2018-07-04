// dependencies
const mongoose = require('mongoose');
const uuid = require('uuid-v4');

// libs
const encryptString = require('../common/utils').encryptString;
const compareToEncryptedString = require('../common/utils').compareToEncryptedString;
const auth = require('../common/auth');

// User schema
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

  return this.findOne({
    email: body.email,
  })

  .then(user => (
    compareToEncryptedString(user.password, body.password)

    .then(() => (
      auth.generateJwt({
        email: user.email,
        token: user.token,
        timestamp: Date.now(),
      })

      .then(token => (
        Promise.resolve(Object.assign(user.getInfo(), {
          token,
        }))
      ))
    ), () => (
      Promise.reject(401)
    ))
  ))

  .catch(() => (
    Promise.reject(500)
  ));
};

userSchema.statics.validateToken = function validateToken(body) {
  return this.findOne({
    email: body.email,
  })

  .then(user => (
    compareToEncryptedString(user.token, body.token)

    .then(() => (
      Promise.resolve(user)
    ))
  ))
  .catch(() => (
    Promise.reject(401)
  ));
};

userSchema.statics.create = function create(body) {
  const requiredKeys = 'email password'.split(' ');

  if (requiredKeys.filter(key => !body[key])[0]) {
    return Promise.reject(400);
  }

  return this.findOne({ email: body.email })

  .then((user) => {
    if (user) {
      return Promise.reject(400);
    }

    const newUser = new this({
      email: body.email,
      password: body.password,
    });

    return newUser.save();
  });
};

module.exports = mongoose.model('users', userSchema);
