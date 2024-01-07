const UserService = require("../user/userService");
const qs = require("qs");
const bcrypt = require('bcrypt');
 const defConfig = require("../../../../config/default");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const UserRepository = require("../user/userRepository");
const { MailtrapClient } = require("mailtrap");
const dotenv = require('dotenv');
const config = dotenv.config().parsed;
const client = new MailtrapClient({ token: config.TOKEN });
const sender = { name: "Test Email", email: config.TOKEN.SENDER_EMAIL };
const nodemailer = require('nodemailer');

class AuthService {
  constructor() {}

  validate(user) {
    let errors = [];
    if (!user.username) {
      throw new Error("Username cannot be empty.");
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
      const generatePass = await this.randomPassword();
      const salt = await bcrypt.genSalt(15);
      user.password = await bcrypt.hash(generatePass, salt);

      const gmailUser = 'fareedagha7440@gmail.com';
      const appPassword = 'your-generated-app-password';

      let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: gmailUser,
          pass: appPassword,
        },
      });

      let info = await transporter.sendMail({
        from: 'fareedagha7440@gmail.com',
        to: email, // Use the user's email as the recipient
        subject: 'Forgot Password',
        text: `This is your new password: ${generatePass}`,
      });

      console.log('Message sent: %s', info.messageId);
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

      // Update the user's password in the database
      const updatedUser = await userService.edit(user._id, { password: user.password });

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
