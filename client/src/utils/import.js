let fs = require("fs");
let path = require("path");
let jwt = require("./jwt");
const Zip = require("node-zip");

let upload = card => {
  // Unzip the uploaded card and store it in hfc-key-store
  console.log(card.buffer);

  let zip = new Zip(card.buffer, { base64: false, checkCRC32: true });
  console.log(zip);

  var userName;
  let key_store = path.join(__dirname, process.env.HFC_KEY_STORE);
  for (var key in zip.files) {
    if (key.indexOf("User") !== -1) {
      userName = key;
    }
    fs.writeFileSync(key_store + "/" + key, zip.files[key]["_data"]);
  }

  console.log("Username", userName);

  // Generate jwt token
  let token = jwt.generate(userName);

  return token;
};

module.exports = {
  upload
};
