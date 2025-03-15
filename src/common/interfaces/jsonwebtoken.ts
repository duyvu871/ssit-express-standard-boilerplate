export interface IDecodedToken<payload = Record<string, any>> {
    /*
     * Audience (aud) Claim - Identifies the recipients that the JWT is intended for.
     * If the aud claim is not present or has multiple values, the JWT must be rejected.
     * The aud value is a string or URI.
     * @example "aud": "https://example.com"
     */
    aud?: string, // audience
    /*
     * JWT ID (jti) Claim - Provides a unique identifier for the JWT.
     * The identifier value must be assigned in a manner that ensures that there is a negligible probability that the same value will be accidentally assigned to a different data object.
     * The jti claim can be used to prevent the JWT from being replayed.
     * The jti value is a case-sensitive string.
     * @example "jti": "a1b2c3d4"
     */
    jti?: string, // JWT ID
    /*
     * Issued At (iat) Claim - Identifies the time at which the JWT was issued.
     * This claim can be used to determine the age of the JWT.
     * The iat value is an integer.
     * @example "iat": 1516239022
     */
    iat?: number, // issued at
    /*
     * Not Before (nbf) Claim - Identifies the time before which the JWT must not be accepted for processing.
     * The nbf value is an integer.
     * @example "nbf": 1516239022 // 2018-01-18T21:30:22+00:00
     */
    nbf?: number, // not before
    /*
     * Expiration Time (exp) Claim - Identifies the expiration time on or after which the JWT must not be accepted for processing.
     * The exp value is an integer.
     * @example "exp": 1516239022 // 2018-01-18T21:30:22+00:00
     */
    exp?: number, // expiration
    /*
     * Subject (sub) Claim - Identifies the principal that is the subject of the JWT.
     * The sub value is a case-sensitive string.
     * @example "sub": "1234567890"
     */
    sub?: string, // subject
    /*
     * Scopes (scopes) Claim - Identifies the scopes that the JWT has access to.
     * The scopes value is an array of strings.
     * @example "scopes": ["User.all", "Store.all"]
     */
    scopes: [] | string[],
    /*
      * Payload (payload) Claim - Contains the claims that are specific to the application.
      * The payload value is an object.
      * @example "payload": {"username": "johndoe"}
     */
    payload?: payload
}