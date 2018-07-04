// dependencies
const jwt = require('jsonwebtoken');

// models
const User = require('../models/User');

module.exports.generateJwt = body => (
  new Promise((resolve, reject) => (
    jwt.sign(body, process.env.SESSION_SECRET, { algorithm: 'HS384' }, (signError, token) => (
      signError ? reject(signError) : resolve(token)
    ))
  ))
);

module.exports.middleware = (req, res, next) => {
  const token = req.headers.Authorization || req.headers.authorization;

  if (!token || !/Bearer [\S]*/.test(token)) {
    return res.sendStatus(401);
  }

  // Bearer asdadsadsddas .split(' ') ['Bearer', 'asdasdsdasds'][1]

  return jwt.verify(token.split(' ')[1], process.env.SESSION_SECRET, { algorithms: ['HS384'] }, (verifyError, jwtPayload) => {
    if (verifyError) {
      return res.sendStatus(401);
    }

    return User.validateToken(jwtPayload)

      .then((user) => {
        req.user = user;
        return next();
      }, err => (
        res.sendStatus(err)
      ));
  });
};
