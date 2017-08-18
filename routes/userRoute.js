const express = require('express');
const middleware = require('../common/auth').middleware;

const router = express.Router();

// users controller
const controller = require('../controllers/userController');

router.post('/login', controller.postLogin);
router.post('/register', controller.postSignUp);

router.get('/profile', middleware, controller.getUserInfo);

module.exports = router;
