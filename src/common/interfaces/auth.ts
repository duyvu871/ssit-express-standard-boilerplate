/**
 * Interface for JWT payload token structure
 */
export interface PayloadToken {
    userId: number;
    username: string;
    roles: string[];
}