const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config');

// Get the user from the JWT in the `auth-token` header and add it to req.user.
const fetchuser = (req, res, next) => {
  const token = req.header('auth-token');
  if (!token) {
    return res.status(401).json({ error: 'Please authenticate using a valid token' });
  }
  try {
    const data = jwt.verify(token, jwtSecret);
    req.user = data.user;
    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Please authenticate using a valid token' });
  }
};

module.exports = fetchuser;
