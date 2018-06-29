var database = require('./database');
var connection = database.connect;
//let Tools = require('../common/tools');
let crypto = require('crypto');

var db = require('./db');
var async = require('async');

var tableName = 'projects';
var field_id = 'id';
var field_name = 'name';
var field_create_ts = 'create_ts';
var field_update_ts = 'update_ts';
var field_unit_count = 'unit_count';
var field_unit_seed_count = 'unit_seed_count';
var field_status = 'status';


function projectDao() {
    this.tableName = tableName;
    this.add = add;
    this.edit = edit;
    this.remove = remove;
    this.query = query;
    this.list = list;
    this.listByTid = listByTid;
    this.bindTeachers = bindTeachers;
    this.queryNameByPid = queryNameByPid;

    function add(project, callback) {
        var sql = 'insert into ' + tableName + '(' + field_name + ',' + field_unit_count + ',' + field_unit_seed_count + ',' + field_status + ') values(\'' + project.name + '\','
            + project.unitCount + ',' + project.unitSeedCount + ',' + project.status + ')';
        connection.query(sql, callback);
    };

    function edit(project, callback) {
        var sql = 'update ' + tableName + ' SET ' + field_name + '=\'' + project.name + '\', ' + field_unit_count + '=' + project.unitCount + ', ' + field_unit_seed_count + '=' + project.unitSeedCount + ' ' + ', ' + field_status + '=' + project.status + ' ' +
            'where ' + field_id + '=' + project.id;
        connection.query(sql, callback);
    }

    function bindTeacher(teachers, callback) {
        connection.query('', callback);
    }

    // function remove(pid, callback) {
    //
    //     connection.query('delete from ' + tableName + ' where ' + field_id + '=' + pid, callback);
    // }

    function remove(pid, cbk) {
        db.getConnection(function (connection) {
            connection.beginTransaction(function (err) {
                if(err) {
                    console.log(err);
                    return;
                }
                
                var task1 = function (callback) {
                    connection.query('delete from projects where id=' + pid, function (err, result) {
                        if (err) {
                            console.log(err);
                            callback(err, null);
                            return;
                        }
                        console.log('projects删除成功');
                        callback(null, result);
                    })
                }

                var task2 = function (callback) {
                    connection.query('delete from project_teacher_association where pid=' + pid, function (err, result) {
                        if (err) {
                            console.log(err);
                            callback(err, null);
                            return;
                        }
                        console.log('项目关联表删除成功');
                        callback(null, result);
                    })
                }

                var task3 = function (callback) {
                    connection.query('delete sa,ss from students_association sa, seeds ss where ss.id=sa.sid and sa.pid=' + pid, function (err, res) {
                        if (err) {
                            console.log(err);
                            callback(err, null);
                            return;
                        }
                        console.log('学生关联表和学生表删除成功');
                        callback(err, res);
                    })
                }

                async.series([task1, task2, task3], function (err, result) {
                    if (err) {
                        console.log(err);
                        //回滚
                        connection.rollback(function() {
                            console.log('出现错误,回滚!');
                            //释放资源
                            connection.release();
                        });
                        return;
                    }
                    connection.commit(function (err) {
                        if (err) {
                            console.log(err);
                            return;
                        }

                        console.log('成功,删除!');
                        cbk();
                        //释放资源
                        connection.release();
                    });
                })
            })
        })
    }

    function query(sql, callback) {
        connection.query(sql, callback);
    }

    function queryNameByPid(pid,callback) {
        var sql = 'select a.name from ' + tableName + ' as a where id= ' + pid;
        connection.query(sql, callback);
    }

    function list(currentPage, pageCount, callback) {
        var sql = 'select * from '+tableName+' limit ' + pageCount + ' offset ' + (currentPage - 1) * pageCount;
        connection.query(sql, callback);
    }

    function listByTid(tid , callback) {
        var sql = 'select p.* from projects as p ,project_teacher_association as ta where p.id = ta.pid and ta.tid = ' + Number(tid);
        connection.query(sql, callback);
    }

    function bindTeachers(pid, ids, callback) {
        // let removePidSql = 'delete from project_teacher_association where pid=' +pid;
        // connection.query(removePidSql, function (err) {
        //     if(err) {
        //         callback(err);
        //     } else {
        //         let values = new Array();
        //         for(let tid of ids) {
        //             var md5 = crypto.createHash('md5');
        //             let rid =  md5.update(pid+''+tid).digest('base64');
        //             let value = [rid, Number(pid), tid];
        //             values.push(value);
        //         }
        //         var sql = 'insert into project_teacher_association (id, pid, tid) values ? on duplicate key update pid = values(pid), tid = values(tid)' ;
        //         connection.query(sql,[values], callback);
        //     }
        // });

        let values = new Array();
        for(let tid of ids) {
            var md5 = crypto.createHash('md5');
            let rid =  md5.update(pid+''+tid).digest('base64');
            let value = [rid, Number(pid), tid];
            values.push(value);
        }
        var sql = 'insert into project_teacher_association (id, pid, tid) values ? on duplicate key update pid = values(pid), tid = values(tid)' ;
        connection.query(sql,[values], callback);

    }
}

module.exports = projectDao;