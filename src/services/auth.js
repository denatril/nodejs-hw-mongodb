const bcrypt = require('bcrypt');
const { randomUUID } = require('crypto');
const User = require('../db/models/user');
const Session = require('../db/models/session');

const FIFTEEN_MINUTES = 15 * 60 * 1000;
const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

const registerUser = async (payload) => {
  const password = await bcrypt.hash(payload.password, 10);
  return User.create({ ...payload, password });
};

const findUserByEmail = (email) => User.findOne({ email });

const createSession = async (userId) => {
  await Session.deleteMany({ userId: userId.toString() });

  const now = Date.now();
  return Session.create({
    userId: userId.toString(),
    accessToken: randomUUID(),
    refreshToken: randomUUID(),
    accessTokenValidUntil: new Date(now + FIFTEEN_MINUTES),
    refreshTokenValidUntil: new Date(now + THIRTY_DAYS),
  });
};

const findSession = (sessionId, refreshToken) =>
  Session.findOne({ _id: sessionId, refreshToken });

const deleteSession = (sessionId, refreshToken) =>
  Session.deleteOne({ _id: sessionId, refreshToken });

const findUserByAccessToken = async (accessToken) => {
  const session = await Session.findOne({ accessToken });

  if (!session || session.accessTokenValidUntil <= new Date()) {
    return null;
  }

  return User.findById(session.userId);
};

module.exports = {
  registerUser,
  findUserByEmail,
  createSession,
  findSession,
  deleteSession,
  findUserByAccessToken,
};
