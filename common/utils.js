const bcrypt = require('bcrypt-nodejs');

module.exports.encryptString = string => (
  new Promise((resolve, reject) => (
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(string, salt, null, (hashErr, hash) => (
        hashErr ? reject(hashErr) : resolve(hash)
      ));
    })
  ))
);

module.exports.compareToEncryptedString = (enctypted, rawString) => (
  new Promise((resolve, reject) => (
    bcrypt.compare(rawString, enctypted, (err, isMatch) => (
      err ? reject(err) : resolve(isMatch)
    ))
  ))
);
