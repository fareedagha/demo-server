const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const AuthService = require('./authService');
const authService = new AuthService();
router.post('/login', async (req, res) => {
  authService
  .login(req.body)
  .then(user => {
    res.send(user)
  })
  .catch(err => {
    console.log('err',err)
    res.status(400).send(err)
  });
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
    res.status(500).send({
      details: [
        {
          message: 'Internal server error',
        },
      ],
    });  }
});


router.post('/sign-out', (req, res) => {
  res.send({ message: 'ok' });
});


// router.post('/refresh-token', (req, res) => {
//
// });

module.exports = router;
