const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/user');

router.get('/', (req, res) => {
    res.redirect('/signin');
});

router.get('/signin', (req, res) => {
    res.render('log/signin');
});

router.post('/signin', passport.authenticate('local-signin', {
    successRedirect: '/home',
    failureRedirect: '/signin',
    passReqToCallback: true
}));

router.get('/signup', (req, res) => {
    res.render('log/signup');
});

router.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/signin',
    failureRedirect: '/signup',
    passReqToCallback: true
}));

module.exports = router; 