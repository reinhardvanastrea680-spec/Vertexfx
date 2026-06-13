import { Router } from 'express';
import { authController } from './auth.controller';
import { authLimiter, registerLimiter } from '../../middleware/rateLimiter';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/authenticate';
import {
  registerSchema, loginSchema, twoFaVerifySchema,
  forgotPasswordSchema, resetPasswordSchema, setup2faSchema, changePasswordSchema,
} from './auth.schemas';

const router = Router();

router.post('/register', registerLimiter, validate(registerSchema), authController.register);
router.get('/verify-email/:token', authController.verifyEmail);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/2fa/verify', authLimiter, validate(twoFaVerifySchema), authController.verifyTwoFA);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', authLimiter, validate(resetPasswordSchema), authController.resetPassword);
router.post('/2fa/setup', authenticate, authController.setup2FA);
router.post('/2fa/confirm', authenticate, validate(setup2faSchema), authController.confirm2FA);
router.delete('/2fa/disable', authenticate, validate(setup2faSchema), authController.disable2FA);

export default router;
