import { Router } from 'express';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();

// Route for user creation
routes.post('/users', UserController.store);

// Route for user login
routes.post('/sessions', SessionController.store);

// Every Route after this line will use this Middleware
routes.use(authMiddleware);

// Route for user update
routes.put('/users', UserController.update);

export default routes;
