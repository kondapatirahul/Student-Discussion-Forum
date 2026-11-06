const jwt = require('jsonwebtoken');

function optionalAuthenticate(req, _res, next) {
  const authorization = req.headers.authorization || '';
  const [scheme, token] = authorization.split(' ');
  if (scheme !== 'Bearer' || !token || !process.env.JWT_SECRET) return next();

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.sub, role: payload.role };
  } catch (_error) {
    // Public reads remain available when an old browser token has expired.
  }
  return next();
}

module.exports = optionalAuthenticate;
