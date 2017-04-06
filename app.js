var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var users = require('./routes/users');

var restResult = require('./restResult');
var config = require('./config/config');

var app = express();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false, limit: '10000kb' }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users/', users);

app.use(function (req, res, next) {
    res.error = function (errorCode, errorReason) {
    	console.log('something wrong!')
        var rest = new restResult();
        rest.errorCode = errorCode;
        rest.errorReason = errorReason;
        res.send(rest);
    };


    res.success = function (returnValue) {
    	console.log('right!');
        var rest = new restResult();
        rest.errorCode = RestResult.NO_ERROR;
        rest.returnValue = returnValue || {};
        res.send(rest);
    };

});
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
	console.log('err');
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
