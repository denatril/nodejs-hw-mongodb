const bcrypt = require('bcrypt');
const createHttpError = require('http-errors');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');
const {
  registerUser,
  findUserByEmail,
  createSession,
  findSession,
  deleteSession,
  updateUserPassword,
  deleteSessionsByUserId,
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

const sendResetEmailController = async (req, res) => {
  if (!process.env.JWT_SECRET || !process.env.APP_DOMAIN) {
    throw createHttpError(500, 'Password reset service is not configured');
  }

  const user = await findUserByEmail(req.body.email);

  if (!user) {
    throw createHttpError(404, 'User not found!');
  }

  const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, {
    expiresIn: '5m',
  });
  const resetLink = `${process.env.APP_DOMAIN}/reset-password?token=${token}`;

  try {
    await sendEmail({
      to: user.email,
      subject: 'Reset your password',
      html: `<p>Reset your password by following this <a href="${resetLink}">link</a>.</p>`,
    });
  } catch {
    throw createHttpError(500, 'Failed to send the email, please try again later.');
  }

  res.status(200).json({
    status: 200,
    message: 'Reset password email has been successfully sent.',
    data: {},
  });
};

const resetPasswordController = async (req, res) => {
  let payload;

  try {
    payload = jwt.verify(req.body.token, process.env.JWT_SECRET);
  } catch {
    throw createHttpError(401, 'Token is expired or invalid.');
  }

  const user = await findUserByEmail(payload.email);

  if (!user) {
    throw createHttpError(404, 'User not found!');
  }

  await updateUserPassword(user._id, req.body.password);
  await deleteSessionsByUserId(user._id);

  res.status(200).json({
    status: 200,
    message: 'Password has been successfully reset.',
    data: {},
  });
};

module.exports = {
  registerController,
  loginController,
  refreshSessionController,
  logoutController,
  sendResetEmailController,
  resetPasswordController,
};
