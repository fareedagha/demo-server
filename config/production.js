module.exports = {

    api: {
      port: 8081,
      root: '/api',
    },
  
    auth: {
      jwt: {
        secret: 'secretKeyForMeanStackdevelopement@abc',
      },
      resetPassword: {
        secret: 'secretKeyForMeanStackdevelopement@abc',
      },
    },
  
    db: {
      url: 'mongodb+srv://fareedagha7440:cHukg7OoT6HpRtvI@cluster0.loowokp.mongodb.net/?retryWrites=true&w=majority',
      name: 'demo-test',
    },
  };