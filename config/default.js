module.exports = {
    env: 'dev',
    secretId: '',
     serverUrl: 'https://2865c199ec81.ngrok.io',
    
    websocket: {
     // connectionUrl: 'https://c4iznyvfpb.execute-api.us-east-1.amazonaws.com/prod'
      // connectionUrl: 'https://c4iznyvfpb.execute-api.us-east-1.amazonaws.com/dev'
    },
  
    api: {
      port: 8080,
      root: '/api',
    },
  
    frontEnd: {
      // domain: 'https://agency.ebailapp.com',
     // domain: 'https://agency.ebailapp.com',
      // domain: 'http://localhost:4200',
    },
  
    auth: {
      jwt: {
        secret: 'secretKeyForMeanStackdevelopement@abc',
      },
      resetPassword: {
        secret: 'secretKeyForMeanStackdevelopement@abcTM#9*Vg',
        ttl: 86400 * 1000, // 1 day
        algorithm: 'aes256',
        inputEncoding: 'utf8',
        outputEncoding: 'hex',
      },
    },
    mailTraf: {
      TOKEN: '43079d249306d3ad43011cd309ff9b3a',
      SENDER_EMAIL : 'fareedagha7440@gmail.com',
    },

    db: {
      url: 'mongodb+srv://fareedagha7440:cHukg7OoT6HpRtvI@cluster0.loowokp.mongodb.net/?retryWrites=true&w=majority',
      name: 'demo-test',
    },
  };