module.exports.blankLine = "[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]";

module.exports.fillLine = char => char.repeat(22);

module.exports.sendToVestaboard = async (axios, readWriteKey, message) => {
  await axios.post('https://rw.vestaboard.com', message, {
    headers: {
      'X-Vestaboard-Read-Write-Key': readWriteKey,
    }
  });
};
