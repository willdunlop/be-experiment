/**
 * Tutorial url - https://medium.freecodecamp.org/learn-how-to-handle-authentication-with-node-using-passport-js-4a56ed18e81e
 * Tutorial Repo - https://github.com/AntonioErdeljac/passport-tutorial/blob/master/app.js
 */

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const cors = require('cors');
const mongoose = require('mongoose');
const morgan = require('morgan');
const errorHandler = require('errorhandler');


mongoose.promise = global.Promise;

const isProduction = process.env.NODE_ENV === 'production';     // methinks a constants file would be a nice place for this to live
const SECRET = 'secret';
const app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '_static')));
app.use(session({
    secret: SECRET,
    cookie: { maxAge: 60000 },
    resave: false,
    saveUninitialized: false
}));

if (!isProduction) app.use(errorHandler());

mongoose.connect("mongodb://localhost:27017/vaporDb", { useNewUrlParser: true });  //Again, constants file
mongoose.set('debug', true);

// Models
require('./models/Users');

// Passport config
require('./config/passport');

// Routes
app.use(require('./routes'));

if(!isProduction) {
    app.use((err, req, res) => {
        console.log("res", res)
        res.status(err.status || 500);  //  Apparently this is not a function (res.status)

        res.json({
            errors: {
                message: err.message,
                error: err
            }
        });
    });
}

app.use((err, req, res) => {
    res.status(err.status || 500);
  
    res.json({
      errors: {
        message: err.message,
        error: {},
      },
    });
  });

app.listen(3005, () => console.log(`\x1b[36mServer running at localhost:3005\x1b[0m`));