let sendEmail = require("./send-email");
let fs = require("fs");
let path = require("path");
let send = (cardName, to) => {
  let card = path.join(__dirname, `../cards/${cardName}`);
  fs.readFile(card, function(err, data) {
    if (err) {
      return err;
    }
    sendEmail.send(cardName, to, data);
  });
};

module.exports = {
  send
};
