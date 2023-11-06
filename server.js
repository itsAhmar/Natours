//importing mongoDB
const mongoose = require('mongoose');

//importing env variables
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' }); //read variables from config file and save them to the node environment.npm start

//uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! Shutting down......');
  console.log(err.name, err.message);
  process.exit(1);
});

//importing express application
const app = require('./app1');

//Enviornment Variable set by express.
//console.log(app.get('env'));

//Enviorment variables set by node internally.
//console.log(process.env);

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DB_PASSWORD);

//Use the lower functions to avoid deprecation warnings. And the connect function will return a promise so we have to handle that promise.
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log('DB connection successfully established'));

//server
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`Listening on port ${port}....`);
});

//unhandled rejection promises
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLER REJECTION! Shutting down......');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
