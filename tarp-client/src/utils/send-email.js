let transporter = require("./transporter");

let send = (cardName, to, data) => {
  // Send Email
  console.log("fake-sent email to", to);
  // return transporter.sendMail(
  //   {
  //     sender: '"Card Dispatcher"<priyanshjain412@gmail.com>',
  //     to: `${to}`,
  //     subject: "Identity card",
  //     body: "Find the card in the attachment below.",
  //     attachments: [{ filename: `${cardName}`, content: data }]
  //   },
  //   function(err, success) {
  //     if (err) {
  //       console.log(err);
  //     } else {
  //       console.log(success);
  //     }
  //   }
  // );
};

module.exports = {
  send
};
