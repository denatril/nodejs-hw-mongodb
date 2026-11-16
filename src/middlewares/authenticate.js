const createHttpError = require('http-errors');
const { findUserByAccessToken } = require('../services/auth');

const authenticate = async (req, res, next) => {
  const [bearer, accessToken] = req.get('Authorization')?.split(' ') || [];

  if (bearer !== 'Bearer' || !accessToken) {
    return next(createHttpError(401, 'Access token expired'));
  }

  const user = await findUserByAccessToken(accessToken);

  if (!user) {
    return next(createHttpError(401, 'Access token expired'));
  }

  req.user = user;
  next();
};

module.exports = authenticate;
