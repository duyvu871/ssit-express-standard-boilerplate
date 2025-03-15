import { Router } from 'express';
import { AuthController } from 'controllers/auth.controller';
import { validateBody } from 'middlewares/validate-request';
import { authenticate } from 'middlewares/authenticate';
import { authValidation } from 'validations/auth.validation';

const router = Router();
const authController = new AuthController();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 tokens:
 *                   type: object
 *                   properties:
 *                     access:
 *                       type: string
 *                     refresh:
 *                       type: string
 *       400:
 *         description: Invalid input
 *       409:
 *         description: Username or email already exists
 */
router.route('/register').post( 
    validateBody(authValidation.registerBody), 
    authController.register
);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login a user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 tokens:
 *                   type: object
 *                   properties:
 *                     access:
 *                       type: string
 *                     refresh:
 *                       type: string
 *       401:
 *         description: Invalid credentials
 *       404:
 *         description: User not found
 */
router.route('/login').post(
    validateBody(authValidation.loginBody), 
    authController.login
);

/**
 * @swagger
 * /auth/refresh-token:
 *   post:
 *     summary: Refresh access token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tokens:
 *                   type: object
 *                   properties:
 *                     access:
 *                       type: string
 *                     refresh:
 *                       type: string
 *       401:
 *         description: Invalid refresh token
 *       404:
 *         description: Refresh token not found
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
 * @swagger
 * /auth/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 profile:
 *                   $ref: '#/components/schemas/UserProfile'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: User profile not found
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