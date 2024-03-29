require("dotenv").config();
var request = require("request");
const fs = require("fs");

let registerSellerUser = (data) => {
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
          "/Users/Lenovo/KYC-and-LOAN-management-system/client/src/cards/Seller-AdminUser.card"
          
        ),
        options: {
          filename:
          "/Users/Lenovo/KYC-and-LOAN-management-system/client/src/cards/Seller-AdminUser.card",
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

function addSeller(data) {
  return registerSellerUser(data);
}

module.exports = {
  addSeller: addSeller
};
