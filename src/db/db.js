var db = {};
var mysql = require('mysql');
var conf = require('./config')
var pool = mysql.createPool(conf);

db.getConnection = function (callback) {
    pool.getConnection(function (err, connection) {
        if(err) {
            callback(null);
            return;
        }
        callback(connection)
    })
}

module.exports = db;