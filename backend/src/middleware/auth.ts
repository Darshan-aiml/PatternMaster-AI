import { Request, Response, NextFunction } from 'express';
import jwt, { JwtHeader, SigningKeyCallback } from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import dotenv from 'dotenv';

dotenv.config();

const JWKS_URI = process.env.OIDC_JWKS_URI || 'https://auth.patternmaster.com/.well-known/jwks.json';
const AUDIENCE = process.env.OIDC_AUDIENCE || 'patternmaster-api';
const ISSUER = process.env.OIDC_ISSUER || 'https://auth.patternmaster.com/';

const client = jwksClient({
  jwksUri: JWKS_URI,
  cache: true,
  rateLimit: true,
  jwksRequestsPerMinute: 10,
});

/**
 * Helper to fetch signing keys from the JWKS endpoint.
 */
function getKey(header: JwtHeader, callback: SigningKeyCallback) {
  if (!header.kid) {
    return callback(new Error('No kid found in token header'));
  }
  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      return callback(err);
    }
    const signingKey = key?.getPublicKey();
    callback(null, signingKey);
  });
}

// Extend Express Request object to hold verified user payload
export interface AuthenticatedRequest extends Request {
  user?: any;
}

/**
 * Middleware to verify JWT authentication token issued by OIDC provider.
 */
export const checkJwt = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      status: 401,
      error: 'Unauthorized',
      message: 'Authorization header is missing or does not use Bearer scheme.',
    });
  }

  const token = authHeader.split(' ')[1];

  const options: jwt.VerifyOptions = {
    audience: AUDIENCE,
    issuer: ISSUER,
    algorithms: ['RS256'],
  };

  jwt.verify(token, getKey, options, (err, decoded) => {
    if (err) {
      console.error('JWT verification failed:', err.message);
      return res.status(401).json({
        status: 401,
        error: 'Unauthorized',
        message: `Token verification failed: ${err.message}`,
      });
    }

    // Attach decoded user payload to request
    req.user = decoded;
    next();
  });
};
