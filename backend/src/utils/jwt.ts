import jwt from 'jsonwebtoken';
import { config } from '../config';
import { AuthPayload } from '../types';

export const generateToken = (payload: AuthPayload): string => {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: '7d' });
};

export const verifyToken = (token: string): AuthPayload => {
  return jwt.verify(token, config.jwtSecret) as AuthPayload;
};
