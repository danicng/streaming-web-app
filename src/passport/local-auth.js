const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');
const emailSignUp = require('../email');


passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    const user = await User.findById(id);
    done(null, user);
});


passport.use('local-signup', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, async (req, email, password, done) => {

    const search = await User.findOne({ email: email });
    if (search) {
        return done(null, false, req.flash('error', 'Usuario ya registrado'));
    }

    const newUser = new User();
    newUser.email = email;
    newUser.password = newUser.encryptPassword(password);
    await newUser.save();
    emailSignUp.sendMailSingUp(email);
    done(null, newUser);

}));

passport.use('local-signin', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, async (req, email, password, done) => {

    const search = await User.findOne({ email: email });
    if (!search) {
        return done(null, false, req.flash('error', 'No existe el usuario'));
    }
    if (!search.comparePassword(password)) {
        return done(null, false, req.flash('error', 'Contraseña Incorrecta'));
    }

    done(null, search);
}));