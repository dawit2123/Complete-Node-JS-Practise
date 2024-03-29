const path = require('path');
const express = require('express');
const AppError = require('./utils/appError');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const errorController = require('./controllers/errorController');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const reviewRouter = require('./routes/reviewRoutes');

const app = express();
//serving the static files
app.use(express.static(path.join(__dirname, 'public')));
//a middlware for setting a limit for the request from a specific ip
const limiter = rateLimit({
  max: 1000,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this pc. Please try again in one hour'
});
app.use('/api', limiter);
//setting the headers
app.use(helmet());
//a middleware for limiting attempts to the login page
const limiterLogin = rateLimit({
  max: 4,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this pc. Please try again in one hour'
});
app.use('/api/v1/users/login', limiterLogin);
//Adding a middleware to the body object
app.use(express.json({ limit: '10kb' }));
//sanitizing against the nosql query injection
app.use(mongoSanitize());
//sanitizing against the xss attacks
app.use(xss());
//preventing the parameter pollution attacks
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
  })
);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
//A handler for the pages that are found in the routes
app.all('*', (req, res, next) => {
  //   const err = new Error();
  //   err.status = 'fail';
  //   err.statusCode = `404 can not get the request ${req.url}`;
  next(new AppError(`404 can not get the request ${req.url}`, 404));
});

//A global error handler middleware
app.use(errorController);
module.exports = app;
