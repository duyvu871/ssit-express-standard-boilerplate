import { z } from 'zod';
import { TokenErrorMessage } from 'common/enums/token-error.enum';

export const tokenValidation = {
    /**
     * Validation schema for token payload data
     */
    tokenPayloadData: z.object({
        userId: z.number().int().positive({
            message: TokenErrorMessage.INVALID_USER_ID
        }),
        username: z.string().min(1, {
            message: TokenErrorMessage.INVALID_USERNAME
        }),
        roles: z.array(z.string().min(1), {
            message: TokenErrorMessage.INVALID_ROLES
        }),
        deviceId: z.string().uuid({
            message: TokenErrorMessage.INVALID_DEVICE_ID
        }).optional()
    }),

    /**
     * Validation schema for decoded token
     */
    decodedToken: z.object({
        payload: z.lazy(() => tokenValidation.tokenPayloadData),
        iat: z.number().int(),
        exp: z.number().int(),
        aud: z.string({
            message: 'Audience (aud) in token is invalid or missing'
        }),
        jti: z.string().uuid({
            message: 'JWT ID (jti) in token is invalid or missing'
        }),
        sub: z.string({
            message: 'Subject (sub) in token is invalid or missing'
        }),
        nbf: z.number().int({
            message: 'Not before time (nbf) in token is invalid'
        }),
        scopes: z.array(z.string(), {
            message: 'Scopes in token are invalid or missing'
        })
    }),

    /**
     * Validation schema for auth tokens
     */
    authTokens: z.object({
        accessToken: z.string().min(1),
        refreshToken: z.string().min(1),
        expiresIn: z.number().int().positive()
    })
};

export type TokenPayloadData = z.infer<typeof tokenValidation.tokenPayloadData>;
export type DecodedToken = z.infer<typeof tokenValidation.decodedToken>;
export type AuthTokens = z.infer<typeof tokenValidation.authTokens>;