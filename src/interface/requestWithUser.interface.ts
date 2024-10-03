import { Request } from 'express';
import { User } from '../api/user/user.interface';

interface RequestWithUser extends Request {
  user: User;
}

export default RequestWithUser;
