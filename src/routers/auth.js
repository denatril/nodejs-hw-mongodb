const express = require('express');
const ctrlWrapper = require('../utils/ctrlWrapper');
const validateBody = require('../middlewares/validateBody');
const {
  registerController,
  loginController,
  refreshSessionController,
  logoutController,
} = require('../controllers/auth');
const { registerUserSchema, loginUserSchema } = require('../validation/auth');

const router = express.Router();

router.post('/register', validateBody(registerUserSchema), ctrlWrapper(registerController));
router.post('/login', validateBody(loginUserSchema), ctrlWrapper(loginController));
router.post('/refresh', ctrlWrapper(refreshSessionController));
router.post('/logout', ctrlWrapper(logoutController));

module.exports = router;
