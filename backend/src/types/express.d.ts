<<<<<<< HEAD
import { User } from '../models/User.entity';
=======
import { User } from '../entities/User.entity';
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234

declare global {
  namespace Express {
    interface Request {
      user?: User;
      userId?: string;
      userRole?: string;
    }
  }
}

<<<<<<< HEAD
export {};
=======
export { };
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
