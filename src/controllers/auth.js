const bcrypt = require('bcrypt');
const createHttpError = require('http-errors');
const {
  registerUser,
  findUserByEmail,
  createSession,
  findSession,
  deleteSession,
} = require('../services/auth');

const cookieOptions = (expires) => ({
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  expires,
});

const setSessionCookies = (res, session) => {
  res.cookie('sessionId', session._id.toString(), cookieOptions(session.refreshTokenValidUntil));
  res.cookie('refreshToken', session.refreshToken, cookieOptions(session.refreshTokenValidUntil));
};

const registerController = async (req, res) => {
  const user = await findUserByEmail(req.body.email);

  if (user) {
    throw createHttpError(409, 'Email in use');
  }

  const newUser = await registerUser(req.body);
  const userData = newUser.toObject();
  delete userData.password;

  res.status(201).json({
    status: 201,
    message: 'Successfully registered a user!',
    data: userData,
  });
};

const loginController = async (req, res) => {
  const user = await findUserByEmail(req.body.email);
  const isPasswordValid = user && (await bcrypt.compare(req.body.password, user.password));

  if (!isPasswordValid) {
    throw createHttpError(401, 'Invalid email or password');
  }

  const session = await createSession(user._id);
  setSessionCookies(res, session);

  res.status(200).json({
    status: 200,
    message: 'Successfully logged in an user!',
    data: { accessToken: session.accessToken },
  });
};

const refreshSessionController = async (req, res) => {
  const { sessionId, refreshToken } = req.cookies;
  const session = await findSession(sessionId, refreshToken);

  if (!session || session.refreshTokenValidUntil <= new Date()) {
    throw createHttpError(401, 'Session not found');
  }

  await deleteSession(sessionId, refreshToken);
  const newSession = await createSession(session.userId);
  setSessionCookies(res, newSession);

  res.status(200).json({
    status: 200,
    message: 'Successfully refreshed a session!',
    data: { accessToken: newSession.accessToken },
  });
};

const logoutController = async (req, res) => {
  const { sessionId, refreshToken } = req.cookies;
  await deleteSession(sessionId, refreshToken);
  res.clearCookie('sessionId');
  res.clearCookie('refreshToken');
  res.status(204).send();
};

module.exports = {
  registerController,
  loginController,
  refreshSessionController,
  logoutController,
};
