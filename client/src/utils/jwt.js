let jwt = require("jsonwebtoken");

let generate = userId => {
  let token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: 86400 // expires in 24 hours
  });

  return token;
};

let verify = token => {
  let user;

  if (token) {
    user = jwt.verify(token, process.env.JWT_SECRET, function(err, decoded) {
      if (err) {
        return false;
      }
      return decoded.id;
    });
  }
  return user;
};

module.exports = {
  generate,
  verify
};
