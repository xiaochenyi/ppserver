var createError = require('http-errors');
var express = require('express');
var database = require('mysql');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var database = require('./src/db/database');

var httpTransmitter = require('./src/middlewares/httpresult.middleware');

// var apiList = require('./api.js');
var indexRouter = require('./routes/index');
var studentsRouter = require('./routes/students');
var teachersRouter = require('./routes/teachers');
var projectsRouter = require('./routes/projects');
var fs = require('fs');
var accessLogfile = fs.createWriteStream('access.log', {flags: 'a'});
var errorLogfile = fs.createWriteStream('error.log', {flags: 'a'});
var app = express();

//加载自定义全局方法
app.locals.Fun = require('./src/common/utils');

// view engine setup
var ejs = require('ejs');
app.set('views', path.join(__dirname, '/template'));
app.engine('.html', ejs.__express);
app.set('view engine', 'html');

//匹配静态文件托管路由  内置中间件
app.use(express.static('static'));
app.use('/upload', express.static('upload'));

//app.use(logger({stream: accessLogfile}));
app.use(logger());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// app.use(logger('dev'));


app.all('*', function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
    res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');

    if (req.method == 'OPTIONS') {
        res.send(200); /让options请求快速返回/
    }
    else {
        next();
    }
});
// apiList(app);

database.init();

app.use(httpTransmitter);
app.use('/students', studentsRouter);
app.use('/teachers', teachersRouter);
app.use('/projects', projectsRouter);
// app.use('/', indexRouter);

// catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404));
// });

// error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};
//
//   // render the error page
//   res.status(err.status || 500);
//   // res.render('error');
// });



// development error handler
// will print stacktrace
// if (app.get('env') === 'development') {
//     app.use(function(err, req, res, next) {
//         var meta = '[' + new Date() + ']' +req.url + '\n';
//         errorLogfile.write(meta +err.stack + '\n');
//         next();
//         res.status(err.status || 500);
//         res.render('error', {
//             message: err.message,
//             error: err
//         });
//     });
// }

module.exports = app;
