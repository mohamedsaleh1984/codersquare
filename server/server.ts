import dotenv from 'dotenv';
import express, { ErrorRequestHandler, RequestHandler } from 'express';
import asyncHandler from 'express-async-handler';

import { initDb } from './datastore';
import { signInHandler, signUpHandler } from './handlers/authHandler';
import {
  createCommentHandler,
  deleteCommentHandler,
  getCommentsHandler,
} from './handlers/commentHandler';
import { createLikeHandler, getLikesHandler } from './handlers/likeHandler';
import {
  createPostHandler,
  deletePostHandler,
  getPostHandler,
  listPostsHandler,
} from './handlers/postHandler';
import { authMiddleware } from './middleware/authMiddleware';
import { errorHandlerMiddleware } from './middleware/errorHandlerMiddleware';
import { loggerMiddleware } from './middleware/loggerMiddleware';

(async () => {
  await initDb();
  //Read .env file
  dotenv.config();

  //run express lib
  const app = express();

  //It parses incoming requests with JSON payloads and is based on body-parser.
  app.use(express.json());

  //Log incoming Requests
  app.use(loggerMiddleware);

  //Public endpoints
  app.get('/healthz', (req, res) => res.send({ status: 'still breathing !!' }));
  app.post('/v1/signup', asyncHandler(signUpHandler));
  app.post('/v1/signin', asyncHandler(signInHandler));

  app.use(authMiddleware);

  //Private endpoints
  app.get('/v1/posts', asyncHandler(listPostsHandler));
  app.post('/v1/posts', asyncHandler(createPostHandler));
  app.delete('/v1/posts/:id', asyncHandler(deletePostHandler));
  app.get('/v1/posts/:id', asyncHandler(getPostHandler));

  app.post('/v1/likes/new', asyncHandler(createLikeHandler));
  app.get('/v1/likes/:postId', asyncHandler(getLikesHandler));

  app.post('/v1/comments/new', asyncHandler(createCommentHandler));
  app.get('/v1/comments/:postId', asyncHandler(getCommentsHandler));
  app.delete('/v1/comments/:id', asyncHandler(deleteCommentHandler));

  app.use(errorHandlerMiddleware);

  app.listen(process.env.PORT || 3000);
})();
