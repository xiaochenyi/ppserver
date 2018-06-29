
// var express = require('express');
// var app = express();
// var app = require('./app.js');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/students');
var apiHandlerRouter = require('./routes/PostApiHandler');
var querystring = require('querystring');



function apiList(app) {

    // console.log("app: " +app);
    app.use('/', indexRouter);

    // app.use('/users', usersRouter);
    app.use('/users', handleParams);

    app.get("/login", function (req, res) {
        res.send("login");
    });


    app.post('/users', usersRouter);
    console.log('1111');
}

function handleParams(req, res) {
    requestMethod = req.method;
    var params ;
    if(requestMethod.toUpperCase() =='GET') {
        params = req.query;
        res.send("users, thanks");
    } else if(requestMethod.toUpperCase() == 'POST') {
        params = req.query;
        // params = req.
        // console.log(req);

        var postData = '';
        req.on("data",function(chunk){
            postData += chunk;
            // console.log("chunk: " + chunk);
        });
        req.on("end",function(){
            postData = decodeURI(postData);
            console.log(postData);
            var dataObject = querystring.parse(postData);
            console.log(dataObject);
            console.log("req post: name:" + req.body.name  +" pw:"+ req.body.pw);
            // console.log(req.param("name"));
            // console.log(req.param('pw'))
            res.send(postData);
            // console.log(req);
        });
    }
    console.log("req params:"+req.params.toString());

    console.log("req query: name:" + req.params.name  +" pw:"+ req.params.pw);
    console.log("req query: name:" + req.query.name  +" pw:"+ req.query.pw);
    console.log("req post: name:" + req.body.name  +" pw:"+ req.body.pw);
    // console.log("req query: name:" + req.query['name']  +" pw:"+ req.query['pw']);

    console.log("base url:"+req.originalUrl);
    console.log("mothed:" + req.method)
    // console.log(req);

}

module.exports = apiList;