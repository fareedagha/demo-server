const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const AuthService = require('./authService');
const UserService = require('../user/userService');

const userService = new UserService();
const authService = new AuthService();
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await userService.findOne({email:email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (passwordMatch) {
      let userData = {
        _id: user._id,
        name: user.name,
        email : user.email,
        createdAt: user.createdAt
      }
      const accessToken = authService.generateAuthToken(user, 3600); //3600
      // const refreshToken = authService.generateAuthToken(user, 4750); //4800
      return res.send({
        user:userData,
        token: {
          access_token: accessToken,
          // refresh_token: refreshToken,
        },
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});



router.post('/refresh-token', async (req, res) => {
  const UserService = require('../user/userService');
  const userService = new UserService();

  const { accessTokenPayload } = req.body;

  let user = await userService.findById(accessTokenPayload._id);

  user = {
    _id: user._id,
    name: user.name,
    email: user.email,
  };

  const reqRefreshToken = req.body.token.refresh_token;

  const tokenValid = authService.isTokenValid(reqRefreshToken);

  if (!tokenValid) {
    res.status(401).send({
      error: {
        error: {
          code: 'TokenExpired'
        }
      }
    });
    return;
  }

  const accessToken = authService.generateAuthToken(user, 3600);
  const refreshToken = authService.generateAuthToken(user, 4750);

  res.send({
    token: {
      access_token: accessToken,
      refresh_token: refreshToken,
    },
  });
});

router.post('/sign-up', (req, res) => {
  authService
    .register(req.body)
    .then(() => res.send({ message: 'User successfully added.' }))
    .catch((err) => {
      res.status(400).json({ error: err.message });
    });
});

router.post('/reset-pass', (req, res) => {
  const {
    password,
    confirmPassword,
    reset_password_token: resetPasswordToken,
  } = req.body;
  authService
    .resetPassword(password, confirmPassword, resetPasswordToken)
    .then(() => res.send({ message: 'ok' }))
    .catch((err) => res.status(400).json({ error: JSON.parse(err) }));
});

router.post('/request-forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const data = await authService.forgetPassword(email);
    res.status(200).send({
      success: true,
      data: data,
    });
  } catch (err) {
    res.send({
      success: false,
      error: {
        code: 4001,
        message: err.message || 'An error occurred during forgot password request.',
      },
    });  }
});


router.post('/sign-out', (req, res) => {
  res.send({ message: 'ok' });
});


// router.post('/refresh-token', (req, res) => {
//
// });

module.exports = router;
