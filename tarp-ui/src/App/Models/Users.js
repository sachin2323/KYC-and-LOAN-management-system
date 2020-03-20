import API from '../Lib/API';
import * as Routes from '../Config/Routes';

var list = (options) => {
  let { onSuccess, onError } = options;
  var url = Routes.LIST_USERS;
  API.get(url).then(function (data) {
    onSuccess(data);
  }).catch(function (error) {
    onError(error);
  })
}


var addUser = (options) => {
  let { onSuccess, onError, data } = options;
  var url = Routes.CREATE_USER;
  API.post(url, data).then(function (data) {
    onSuccess(data);
  }).catch(function (error) {
    onError(error);
  })
}


export {
  list,
  addUser
}