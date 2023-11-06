const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./Controllers/errorController');

//importing routes
const tourRouter = require('./Routes/tourRoutes');
const userRouter = require('./Routes/userRoutes');
const reviewRouter = require('./Routes/reviewRoutes');

const app = express(); //created app variable and assigning the result of calling express

//GLOBAL MIDDLEWARES

//set seurity http header
app.use(helmet());

//morgan middleware
if (process.env.NODE_ENV === 'development') {
  //Morgan Middleware
  app.use(morgan('dev'));
}

//Apllying rate limiting
const Limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP. Please try again in an hour.',
});
app.use('/api', Limiter);

//Body parser -- reading data from body into req.body
app.use(express.json({ limit: '10kb' })); //limiting body size to 10KB.

//Data sanitization against NOSQL query injection.
app.use(mongoSanitize());

//Data sanitization against XSS attacks
app.use(xss());

//Prevent Parameter Pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'ratingsQuantity',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

//serving static files
app.use(express.static(`${__dirname}/public`));

//Test Middleware  -- use to get token
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  //console.log(req.headers);
  next();
});

//Routes
app.use('/api/v1/tours', tourRouter); //middleware
app.use('/api/v1/users', userRouter); //middleware
app.use('/api/v1/reviews', reviewRouter); //middleware

//Defining handler for the routes that are not cached by our routes.
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

//global middleware for error handling
app.use(globalErrorHandler);

//exporting app to server.js
module.exports = app;
