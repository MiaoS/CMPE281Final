var User = require('../model/user');
var LocalStrategy = require('passport-local').Strategy;
var bCrypt = require('bcrypt-nodejs');
var log = require('../util/log');

function authByHead() {
    var username = req.get('username');
    var password = req.get('password');

}

module.exports.nextOrRedirect = function (req, res, next) {
    req.isAuthenticated() ? next() : res.redirect('/');
};
module.exports.init = function (passport) {

    // Passport needs to be able to serialize and deserialize users to support persistent login sessions
    passport.serializeUser(function (user, done) {
        done(null, user._id);
    });

    passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
            done(err, user);
        });
    });

    // Setting up Passport Strategies for Login and SignUp/Registration
    passport.use('signin', new LocalStrategy({
            passReqToCallback: true
        },
        function (req, username, password, done) {


            // check in mongo if a user with username exists or not
            findTheUser = function () {
                log.v('signin, username = ', username, ', psw = ', password);
                User.findOne({'username': username},
                    function (err, user) {
                        // In case of any error, return using the done method
                        if (err)
                            return done(err);
                        // Username does not exist, log the error and redirect back
                        if (!user) {
                            console.log('User Not Found with username ' + username);
                            return done(null, false, req.flash('message', 'User Not found.'));
                        }
                        // User exists but wrong password, log the error
                        if (!isValidPassword(user, password)) {
                            console.log('Invalid Password');

                            return done(null, false, req.flash('message', 'Invalid Password')); // redirect back to login page
                        }
                        // User and password both match, return user from done method
                        // which will be treated like success
                        return done(null, user);
                    }
                );
            };

            process.nextTick(findTheUser);

        })
    );


    var isValidPassword = function (user, password) {
        // return bCrypt.compareSync(password, user.password);
        return password == user.password;
    };

    passport.use('signup', new LocalStrategy({
            passReqToCallback: true // allows us to pass back the entire request to the callback
        },
        function (req, username, password, done) {
            findOrCreateUser = function () {
                // find a user in Mongo with provided username
                User.findOne({'username': username}, function (err, user) {
                    // In case of any error, return using the done method
                    if (err) {
                        console.log('Error in SignUp: ' + err);
                        return done(err);
                    }
                    // already exists
                    if (user) {
                        console.log('User already exists with username: ' + username);
                        return done(null, false, req.flash('message', 'User Already Exists'));
                    } else {
                        // create the user
                        var newUser = new User(req.body);

                        // save the user
                        newUser.save(function (err) {
                            if (err) {
                                console.log('Error in Saving user: ' + err);
                                throw err;
                            }
                            console.log('User Registration succesful');
                            return done(null, newUser);
                        });
                    }
                });
            };
            // Delay the execution of findOrCreateUser and execute the method
            // in the next tick of the event loop
            process.nextTick(findOrCreateUser);
        })
    );

};