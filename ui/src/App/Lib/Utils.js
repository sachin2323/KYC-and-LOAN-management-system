import moment from "moment";

var isAuthenticated = function() {
  return JSON.parse(localStorage.getItem("currentUser"));
};

var clearLocal = function() {
  for (var key in localStorage) {
    if (localStorage.hasOwnProperty(key) && key) {
      localStorage.removeItem(key);
    }
  }
};

var getHeaders = function(contentType) {
  var currentUser = isAuthenticated();

  if (!currentUser) {
    return {
      Accept: "application/json",
      "Content-Type": contentType,
      dataType: "json"
    };
  } else {
    return {
      Accept: "application/json",
      "Content-Type": contentType,
      dataType: "json",
      token: currentUser.token
    };
  }
};

let timeParser = GMT => {
  let date = moment(GMT).format("LLL");
  return date;
};

let unixToLocal = unixTime => {
  var local = moment(unixTime, "YYYYMMDD").format("LLL");
  return local;
};

let formatDateTime = (date, time) => {
  var local;
  if (!date) {
    return "-";
  } else if (!time) {
    local = moment(date.toString(), "YYYYMMDD").format("LL");
  } else {
    local = moment(date.toString() + time.toString(), "YYYYMMDDhhmmss").format(
      "LLL"
    );
  }
  return local;
};

export {
  isAuthenticated,
  getHeaders,
  clearLocal,
  timeParser,
  unixToLocal,
  formatDateTime
};
