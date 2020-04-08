require("dotenv").config();
var request = require("request");
const fs = require("fs");

let registerBuyerUser = (data) => {
  var options = {
    method: "POST",
    url: "http://localhost:3000/api/login",
    headers: {
      "Cache-Control": "no-cache",
      "content-type":
        "multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW"
    },
    formData: {
      card: {
        value: fs.createReadStream(
        "/Users/Lenovo/KYC-and-LOAN-management-system/client/src/cards/Buyer-AdminUser.card"
        ),
        options: {
          filename:
          "/Users/Lenovo/KYC-and-LOAN-management-system/client/src/cards/Buyer-AdminUser.card",
          contentType: null
        }
      }
    }
  };

  return request(options, function(error, response, body) {
    if (error) throw new Error(error);
    console.log("hello", body);

    let token = JSON.parse(body).token;
    options = {
      method: "POST",
      url: "http://localhost:3000/api/add-user",
      headers: {
        "Cache-Control": "no-cache",
        token,
        "Content-Type": "application/json"
      },
      body:data,
      json: true
    };

    return request(options, function(error, response, body) {
      if (error) throw new Error(error);

      console.log(body);
    });
  });
};



function addBuyer(data) {
  return registerBuyerUser(data);
}

module.exports = {
  addBuyer: addBuyer
};

//name, email,role ="Client",PPSId
/*name: name,
        email: email,
        role: "Client",
        PPSId: PPSId */
