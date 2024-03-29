var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const hbs = require('express-handlebars');
// const fileUpload = require('express-fileupload')
var adminRouter = require('./routes/admin');
var usersRouter = require('./routes/users');
var session =require('express-session') 
const helpers=require("handlebars-helpers")();


var app = express();
// app.use(fileUpload())
var db=require('../dbconnections/dbConnection')


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.engine('hbs',hbs.engine({extname:'hbs',defaultLayout:'layout',layoutsDir:__dirname+'/views',partialsDir:__dirname+'/views/',helpers:helpers}))

app.use(session({secret: "key",cookie:{maxAge:60000*5},resave:false,saveUninitialized:false }))
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/admin',express.static(path.join(__dirname, 'public')));

db.connect((err)=>{
  if(err) console.log(' Connection error '+err);
  else console.log('database connected');
})

app.use('/', adminRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  // next(createError(404));

  // render error page here 

  res.render('error')
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
