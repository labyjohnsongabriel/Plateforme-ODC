import { User } from '../entities/User.entity';

declare global {
  namespace Express {
    interface Request {
      user?: User;
      userId?: string;
      userRole?: string;
    }
  }
}

export { };