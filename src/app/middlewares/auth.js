import jwt from 'jsonwebtoken';
import { promisify } from 'util';

import authConfig from '../../config/auth';

// Middleware to bring the user's jwt token from the Bearer Header Authorization
export default async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // If token does no exist, an error is returned
  if (!authHeader) {
    return res.status(401).json({ error: 'Token not provided' });
  }

  // Return array spliting the word Bearer(position[0]) and the ...
  // ... token(position[1]), in this case i am just taking the token from the array
  const [, token] = authHeader.split(' ');

  // If jwt token is not valid, an error ir returned
  try {
    const decoded = await promisify(jwt.verify)(token, authConfig.secret);

    // Include user id in req
    req.userId = decoded.id;

    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Token invalid' });
  }
};
