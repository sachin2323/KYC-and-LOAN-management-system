const axios = require('axios')

async function fetch(PPSID) {
  return axios.get(`http://192.168.31.236:9000/PPSInfo/${PPSID}`)
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