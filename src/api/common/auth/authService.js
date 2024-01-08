const UserService = require("../user/userService");
const qs = require("qs");
const bcrypt = require('bcrypt');
 const defConfig = require("../../../../config/default");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const UserRepository = require("../user/userRepository");
const dotenv = require('dotenv');
const config = dotenv.config().parsed;
const nodemailer = require('nodemailer');
const gmailUser = config.SENDER_EMAIL
const appPassword = config.APP_PASSWORD

class AuthService {
  constructor() {}

  validate(user) {
    let errors = [];
    if (!user.username) {
      throw {
        details: [
          {
            message: "Username cannot be empty.",
          },
        ],
      };
    }

    return user;
  }

  async myCustomMethod(ctx){
    let cmd = await ctx.sendCommand(
        'AUTH PLAIN ' +
            Buffer.from(
                '\u0000' + ctx.auth.credentials.user + '\u0000' + ctx.auth.credentials.pass,
                'utf-8'
            ).toString('base64')
    );

    if(cmd.status < 200 || cmd.status >=300){
        throw new Error('Failed to authenticate user: ' + cmd.text);
    }
}

async forgetPassword(email) {
  try {
    const userService = new UserService();
    console.log('email', email);

    const user = await userService.findOne({ email });
    console.log('user', user);

    if (user) {
      const generatePass = await this.randomPassword(6);
      let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: gmailUser,
          pass: appPassword,
        },
      });

      let info = await transporter.sendMail({
        from: gmailUser,
        to: email, // Use the user's email as the recipient
        subject: 'Forgot Password',
        text: `This is your new password for Product Demo App: ${generatePass}`,
      });
      const updatedUser = await userService.editUser(user._id, { password: generatePass });
      return updatedUser;
    } else {
      throw {
        details: [
          {
            message: 'User with this email does not exist',
          },
        ],
      };
    }
  } catch (error) {
    console.error('Error sending email:', error);
    // Handle the error or return an appropriate response
    throw {
      details: [
        {
          message: 'Error sending email',
        },
      ],
    };
  }
}



  generateAuthToken(user, ttl) {
    user.id = user._id;
    const token = jwt.sign(user, defConfig.auth.jwt.secret, {
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
