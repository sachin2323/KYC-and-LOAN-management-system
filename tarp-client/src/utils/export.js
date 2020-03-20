let fs = require("fs");
let path = require("path");
let card = require("./card");
const Zip = require("node-zip");

let compress = (name, userId, email) => {
  let zip = new Zip();
  var userName = userId;

  var cardFileName = name + ".card";
  let key = path.join(__dirname, process.env.HFC_KEY_STORE);
  var profile = fs.readFileSync(key + "/" + userName, "utf8");

  var signingIdentity = JSON.parse(profile).enrollment.signingIdentity;

  var pubFile = signingIdentity + "-pub";
  var privFile = signingIdentity + "-priv";

  var pubFileContent = fs.readFileSync(key + "/" + pubFile, "utf8");
  var privFileContent = fs.readFileSync(key + "/" + privFile, "utf8");

  zip.file(pubFile, pubFileContent);
  zip.file(privFile, privFileContent);
  zip.file(userName, profile);
  var data = zip.generate({ base64: false, compression: "DEFLATE" });
  fs.writeFileSync(`./cards/${cardFileName}`, data, "binary");

  // After compression
  // Delete credential in hfc-key-store after compression
  fs.unlink(`${key}/${userId}`, err => {
    if (err) throw err;
  });
  fs.unlink(`${key}/${signingIdentity}-pub`, err => {
    if (err) throw err;
  });
  fs.unlink(`${key}/${signingIdentity}-priv`, err => {
    if (err) throw err;
  });

  // Send Email
  console.log(cardFileName, email)
  card.send(cardFileName, email);
};

module.exports = {
  compress
};
