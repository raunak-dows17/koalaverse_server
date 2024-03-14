const jwt = require("jsonwebtoken");

function AuthMiddleware(req, res, next) {
  const token = req.header("token");
  if (!token) {
    return res.status(401).json({
      error: "Token is required!!!",
    });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({
      error: "Access Denied",
    });
  }
}

module.exports = AuthMiddleware;
