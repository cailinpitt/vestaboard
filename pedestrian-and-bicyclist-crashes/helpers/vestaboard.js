const axios = require('axios');

module.exports.sendToVestaboard = (readWriteKey, message) => {
  await axios.post('https://rw.vestaboard.com', message, {
    headers: {
      'X-Vestaboard-Read-Write-Key': readWriteKey,
    }
  });
};
