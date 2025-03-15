import { Router } from 'express';
import { AuthController } from 'controllers/auth.controller';
import { validateBody } from 'middlewares/validate-request';
import { authenticate } from 'middlewares/authenticate';
import { authValidation } from 'validations/auth.validation';

const router = Router();
const authController = new AuthController();

/**
 * @route POST /auth/register
 * @desc Register a new user
 * @access Public
 */
router.route('/register').post( 
    validateBody(authValidation.registerBody), 
    authController.register
);

/**
 * @route POST /auth/login
 * @desc Login a user
 * @access Public
 */
router.route('/login').post(
    validateBody(authValidation.loginBody), 
    authController.login
);

/**
 * @route POST /auth/refresh-token
 * @desc Refresh access token
 * @access Public
 */
router.route('/refresh-token').post(
    validateBody(authValidation.refreshTokenBody),
    authController.refreshToken
);

/**
 * @route POST /auth/logout
 * @desc Logout a user
 * @access Public
 */
router.route('/logout').post(
    validateBody(authValidation.logoutBody),
    authController.logout
);

/**
 * @route GET /auth/profile
 * @desc Get user profile
 * @access Private
 */
router.route('/profile').get(
    authenticate,
    authController.getProfile
);

/**
 * @route PUT /auth/change-password
 * @desc Change user password
 * @access Private
 */
router.route('/change-password').put(
    authenticate,
    validateBody(authValidation.changePasswordBody),
    authController.changePassword
);

/**
 * @route POST /auth/request-password-reset
 * @desc Request password reset
 * @access Public
 */
router.route('/request-password-reset').post(
    validateBody(authValidation.requestPasswordResetBody),
    authController.requestPasswordReset
);

/**
 * @route POST /auth/reset-password
 * @desc Reset password with token
 * @access Public
 */
router.route('/reset-password').post(
    validateBody(authValidation.resetPasswordBody),
    authController.resetPassword
);

export default router;