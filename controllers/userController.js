// models
const User = require('../models/User');

module.exports = {
  postLogin: (req, res) => {
    User.login(req.body)

      .then(user => (
        res.json(user)
      ))

      .catch(err => (
        res.sendStatus(err)
      ));
  },

  postSignUp: (req, res) => {
    User.create(req.body)

      .then(() => (
        User.login(req.body)
      ))

      .then(user => (
        res.status(201).json(user)
      ))

      .catch(err => (
        res.sendStatus(err)
      ));
  },

  getUserInfo: (req, res) => {
    res.json(req.user.getInfo());
  },
};
