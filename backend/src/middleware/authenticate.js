const jwt = require('jsonwebtoken');

function authenticate(req, res, next) {
  const authorization = req.headers.authorization || '';
  const [scheme, token] = authorization.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication is required.'
    });
  }

  if (!process.env.JWT_SECRET) {
    return res.status(503).json({
      success: false,
      message: 'Authentication is not configured on this server.'
    });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.sub, role: payload.role };
    return next();
  } catch (_error) {
    return res.status(401).json({
      success: false,
      message: 'Your session is invalid or has expired. Please log in again.'
    });
  }
}

module.exports = authenticate;
