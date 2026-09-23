import { Request } from 'express';

export type Role = 'CUSTOMER' | 'ORGANISER' | 'ADMIN';

export interface AuthPayload {
  userId: string;
  email: string;
  role: Role;
}

export interface AuthRequest extends Request {
  user?: AuthPayload;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}
