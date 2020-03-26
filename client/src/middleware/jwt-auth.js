const jwt = require("../utils/jwt");
const noAuthRoutes = ["/api/add-organization", "/api/login"];

module.exports = {
  isAuthenticated: (req, res, next) => {
    console.log(req.url);
    if (noAuthRoutes.includes(req.url)) return next();
    const user = jwt.verify(req.headers.token);

    if (user) {
      req.user = user;
      return next();
    }
    let err = new Error();
    err.status = 500;
    err.message = "Invalid token supplied with request.";
    return next(err);
  }
};
