const UserService = require("../user/userService");
const qs = require("qs");
const config = require("../../../../config/default");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const UserRepository = require("../user/userRepository");

class AuthService {
  constructor() {}

  validate(user) {
    let errors = [];
    if (!user.username) {
      throw new Error("Username cannot be empty.");
    }

    return user;
  }

  register(user) {
    const userService = new UserService();

    return Promise.resolve()
      .then(() => this.validate(user))
      .then((user) => {
        return userService.findByUsername(user.name).then((u) => {
          if (u) {
            throw new Error("User already exists");
          }
          return userService.addUser(user);
        });
      });
  }

  // resetPassword(password, confirmPassword, resetPasswordToken) {
  //   const userService = new UserService();

  //   if (password.length < 6) {
  //     throw new Error("Password should be longer than 6 characters");
  //   }

  //   if (password !== confirmPassword) {
  //     throw new Error("Password and its confirmation do not match.");
  //   }

  //   const tokenContent = cipher.decipherResetPasswordToken(resetPasswordToken);
  //   if (new Date().getTime() > tokenContent.valid) {
  //     throw new Error("Reset password token has expired.");
  //   }

  //   const { salt, passwordHash } = cipher.saltHashPassword(password);
  //   return userService.changePassword(tokenContent.userId, salt, passwordHash);
  // }



  generateAuthToken(user, ttl) {
    user.id = user._id;
    const token = jwt.sign(user, config.auth.jwt.secret, {
      expiresIn: ttl
    });
    return token;
  }

  isTokenValid(token){
    const decodedToken = jwt.decode(token);
    // console.log('decoded', decodedToken);
    
    const curTime = Math.round(Date.now() / 1000)
    // console.log('exp', decodedToken.exp, 'current', curTime );
    if (decodedToken.exp > curTime) {
      // console.log('Refresh Active');
      return true;
    }
    else{
      // console.log('Refresh Expired');
      return false;
      // return cb(null, false);
    }

  }
  
  randomPassword(length) {
    const lettersBig = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lettersSmall = "abcdefghijklmnopqrstuvwxyz";
    const symbols = "!@#$%^&*()-+<>";
    const numbers = "0123456789"

    var pass = "";
    for (var x = 0; x < length; x++) {
      if (x === 0) {
        var i = Math.floor(Math.random() * lettersBig.length);
        pass += lettersBig.charAt(i);
      }

      if (x === 1) {
        var i = Math.floor(Math.random() * lettersSmall.length);
        pass += lettersSmall.charAt(i);
      }
      
      if (x === 2) {
        var i = Math.floor(Math.random() * symbols.length);
        pass += symbols.charAt(i);
      }
      
      if (x > 2) {
        var i = Math.floor(Math.random() * numbers.length);
        pass += numbers.charAt(i);
      }
    }
    
    console.log(pass)
    return pass;
  }

}

module.exports = AuthService;
