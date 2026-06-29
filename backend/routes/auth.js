import express from 'express';
const router = express.Router();

import * as authController from '../controllers/authController.js';
import authMiddleware from '../middleware/auth.js';

//Public Routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/reset-password', authController.requestPasswordReset);

//Protected Routes
router.get('/me',authMiddleware , authController.getCurrentUser);

export default router;