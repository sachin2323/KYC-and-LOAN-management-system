require("dotenv").config();
const Handler = require("../handler");
let registerCentralBank = () => {
  let requestData = {
    name: "Buyer",
    email: "buyer@gmail.com",
    organization_type: "Buyer",
    created_at: new Date().toISOString()
  };
  let handler = new Handler("admin");
  handler
    .init()
    .then(function() {
      return handler.addOrganization(requestData);
    })
    .then(function(data) {
      console.log(data);
    })
    .catch(function(err) {
      console.log(err);
    });
};

registerCentralBank();
