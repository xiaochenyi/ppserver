var database = require('mysql');
var conf = require('./config')

var connection = database.createConnection(conf)


var init = function () {
    // connection.query('create database ' + DATABASE_TEACH_SYS, function(err){
    //     if(err && err.number != mysql.ERROR_DB_CREATE_EXISTS) {
    //         throw err;
    //     }
    // });

    // connection.query('use ' + DATABASE_TEACH_SYS, function (err) {
    //     if (err && err.number != mysql.ERROR_DB_CREATE_EXISTS) {
    //         throw err;
    //     }
    // });
    connection.query('create table IF NOT EXISTS ' + 'teach_info ' + '(id INT AUTO_INCREMENT, name VARCHAR(255), introduction TEXT, info TEXT,phone VARCHAR(20), email VARCHAR(255),company VARCHAR(255), department VARCHAR(255), post VARCHAR(255), PRIMARY KEY (id))', function (err) {
        if (err && err.number != 'ERROR_DB_CREATE_EXISTS') {
            throw err;
        }
    });
    connection.query('create table if not exists ' + 'projects' + ' (id INT AUTO_INCREMENT, name VARCHAR(255), create_ts timestamp default current_timestamp, update_ts timestamp on update current_timestamp, status int, unit_count int, unit_seed_count int, primary key (id))', function (err) {
        if (err && err.number != 'ERROR_DB_CREATE_EXISTS') {
            throw err;
        }
    });

    const teacherTableSql = 'create table if not exists ' + 'seeds ' + '(id VARCHAR(255), name VARCHAR(255), create_ts timestamp default current_timestamp, phone VARCHAR(20), email VARCHAR(255), company VARCHAR(255), ' +
        'department VARCHAR(255), post VARCHAR(255), primary key (id))';
    connection.query(teacherTableSql, function (err) {
        if (err && err.number != 'ERROR_DB_CREATE_EXISTS') {
            throw err;
        }
    });

    const projectTeacherAssociationTableSql = 'create table if not exists ' + 'project_teacher_association ' + '(id VARCHAR(255), pid int, tid int, primary key (id))';
    connection.query(projectTeacherAssociationTableSql, function (err) {
        if (err && err.number != 'ERROR_DB_CREATE_EXISTS') {
            throw err;
        }
    });

    const studentsAssociationTableSql = 'create table if not exists ' + 'students_association ' + '(id VARCHAR(255), pid int, tid int, sid VARCHAR(255), primary key (id))';
    connection.query(studentsAssociationTableSql, function (err) {
        if (err && err.number != 'ERROR_DB_CREATE_EXISTS') {
            throw err;
        }
    });

    console.log("初始化表完成");
}

// function init() {
//     createTeachSys();
//     ç
// }

// var database = {}

// database.connect = connection;
// init();

module.exports = {
    connect: connection,
    init: init
};

