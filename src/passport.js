const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const passportJWT = require('passport-jwt');
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;
const config = require('config');
const UserService = require('./api/common/user/userService');
const userService = new UserService();
const bcrypt = require('bcrypt');

// passport.use(new LocalStrategy({
//   usernameField: 'email',
//   passwordField: 'password',
// },
// (username, password, cb) => {
//   userService
//     .findByUsername(username)
//     .then(user => {

//       // console.log(user);
//       const { passwordHash } = cipher.sha512(password, user.salt);

//       console.log('hash', user.passwordHash !== passwordHash)
//       console.log(user.password === password);
//       // user.passwordHash !== passwordHash
//       if (!user || user.password !== password) {
//         console.log('1');
//         return cb(null, false, { message: 'Incorrect utils or password.' });
//       }
//       // console.log(user)

//       return cb(null, user, { message: 'Logged In Successfully' });
//     })
//     .catch(() => {
//       return cb(null, false, { message: 'Incorrect utils or password. 1' });
//     });
// }));

// passport.use(new JWTStrategy({
//   jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
//   secretOrKey: config.get('auth.jwt.secret'),
// },
// (jwtPayload, cb) => {
//   return cb(null, jwtPayload);
// }));


passport.use(new LocalStrategy({
  usernameField: 'username',
  passwordField: 'password',
},
(email, password, cb) => {
  userService
    .findByUsername(email)
    .then(async user => {
      const salt = await bcrypt.genSalt(15)
      password = await bcrypt.hash(password, salt);

      if (!user || user.password !== password) {
        return cb(null, false, { message: 'Incorrect utils or password.' });
      }
      return cb(null, { id: user._id, role: user.roles }, { message: 'Logged In Successfully' });
    })
    .catch(() => cb(null, false, { message: 'Incorrect utils or password.' }));
}));

passport.use(new JWTStrategy({
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
  secretOrKey: config.get('auth.jwt.secret'),
},
(jwtPayload, cb) => {
  return cb(null, jwtPayload);
}));
