const axios = require('axios')

async function fetch(aadhaarID) {
  return axios.get(`http://192.168.31.236:9000/aadhaarInfo/${aadhaarID}`)
    .then(function (response) {
      return response.data;
    })
    .catch(function (error) {
      console.log(error);
    });
}

module.exports = {
  fetch
}