var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
const hbs = require('express-handlebars');
var logger = require('morgan');
var usersRouter = require('./routes/users');
var adminRouter = require('./routes/admin');
var cors= require('cors')
const Handlebars = require('handlebars')
const helpers=require("handlebars-helpers")();

const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access')


var app = express();
var db=require('../dbconnections/dbConnection')
// var allowCrossDomain = function(req, res, next) {
//   res.header('Access-Control-Allow-Origin', "*");


//   next();
// }




// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(cors({Credentials:true,origin:'http://localhost:8001'}))
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.engine('hbs',hbs.engine({extname:'hbs',defaultLayout:'layout',handlebars: allowInsecurePrototypeAccess(Handlebars),layoutsDir:__dirname+'/views',partialsDir:__dirname+'/views',helpers:helpers}))

Handlebars.registerHelper( "when",function(operand_1, operator, operand_2, options) {
  var operators = {
   'eq': function(l,r) { return l == r; },
   'noteq': function(l,r) { return l != r; },
   'gt': function(l,r) { return Number(l) > Number(r); },
   'or': function(l,r) { return l || r; },
   'and': function(l,r) { return l && r; },
   '%': function(l,r) { return (l % r) === 0; }
  }
  , result = operators[operator](operand_1,operand_2);

  if (result) return options.fn(this);
  else  return options.inverse(this);
});


// Handlebars.registerHelper("eq", function(a, b, options) {
//   return a == b ? options.fn(this) : options.inverse(this);
// });


db.connect((err)=>{
  if(err) console.log(' Connection error '+err);
  else console.log('database connected');
})
// const config = {
//   headers: {
//     "Access-Control-Allow-Origin": "*",
//     "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS"
//   }
// };
app.use('/', usersRouter);
app.use('/admin',adminRouter );

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
