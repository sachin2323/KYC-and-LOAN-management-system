import API from "../Lib/API";
import * as Routes from "../Config/Routes";

var systemPing = function(options) {
  // eslint-disable-next-line
  let { onSuccess, onError } = options;

  var currentUser = getCurrentUser();

  if (currentUser) {
    fetchCurrentUser({
      onSuccess: function(data) {
        var localCurrentUser = Object.assign(
          {},
          getCurrentUser(),
          data.response
        );
        setCurrentUser(localCurrentUser);
        onSuccess(data);
      },
      onError: function(data) {
        onError(data);
      }
    });
  } else {
    onError();
  }
};

var fetchCurrentUser = function(options) {
  let { onSuccess, onError } = options;
  var url = Routes.CURRENT_USER_INFO;
  console.log("attempting get request");
  API.get(url)
    .then(function(data) {
      onSuccess(data);
    })
    .catch(function(error) {
      onError(error);
    });
};

var signUp = function(options) {
  let { data, onSuccess, onError } = options;
  var url = Routes.SIGNUP;
  API.post(url, data)
    .then(function(data) {
      onSuccess(data);
    })
    .catch(function(error) {
      onError(error);
    });
};

var setCurrentUser = function(userData) {
  localStorage.setItem("currentUser", JSON.stringify(userData));
};

var getCurrentUser = function(userData) {
  return JSON.parse(localStorage.getItem("currentUser"));
};

var logout = function(options) {
  let { onSuccess, onError } = options;
  localStorage.removeItem("currentUser");
  onSuccess({});
};

var getOrganizationsToLocal = function(participants) {
  return JSON.parse(localStorage.getItem("organizations"));
};

var login = function(options) {
  let { data } = options;

  return setCurrentUser({ token: data.token });
};

export {
  systemPing,
  signUp,
  getCurrentUser,
  getOrganizationsToLocal,
  logout,
  login,
  fetchCurrentUser
};
