'use strict';

const { User, AuthenticationRequired } = require('unleash-server');

const passport = require('passport');

const LocalStrategy = require('passport-local').Strategy;

const path = require('path');

passport.use(new LocalStrategy(
    function (username, password, done) {
        if (username == process.env.ADMIN_EMAIL && password == process.env.ADMIN_PASSWORD) {
            return done(null, new User({
                username: username,
                password: password,
                email: username
            }));
        }
        return done(null, false);
    }
));

function customAuth(app) {

    app.use(require('cookie-parser')());
    app.use(require('body-parser').urlencoded({ extended: true }));

    app.use(passport.initialize());
    app.use(passport.session());

    passport.serializeUser((user, done) => done(null, user));
    passport.deserializeUser((user, done) => done(null, user));

    app.get('/login', function(req, res){
        res.sendFile(path.join(__dirname, "/login.html"));
    })

    app.post('/login',
        passport.authenticate('local', { failureRedirect: '/login' }),
        function (req, res) {
            res.redirect('/');
        });


    app.use('/api/admin/', (req, res, next) => {
        if (req.user) {
            next();
        } else {
            // Instruct unleash-frontend to pop-up auth dialog
            return res
                .status('401')
                .json(
                    new AuthenticationRequired({
                        path: '/login',
                        type: 'custom',
                        message: `You have to identify yourself in order to use Unleash.
                        Click the button and follow the instructions.`,
                    })
                )
                .end();
        }
    });

    app.use('/api/client', (req, res, next) => {
        if (req.header('authorization') === process.env.CLIENT_SECRET) {
            next();
        } else {
            res.sendStatus(401);
        }
    });
}

module.exports = customAuth;