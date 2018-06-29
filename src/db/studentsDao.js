var database = require('./database');
var connection = database.connect;
var crypto = require('crypto');

var tableName = 'seeds';
var field_id = 'id';
var field_name = 'name';
var field_create_ts = 'create_ts';
var field_phone = 'phone';
var field_email = 'email';
var field_company = 'company';
var field_department = 'department';
var field_post = 'post';
var field_tid = 'tid';
var field_pid = 'pid';


function studentDao() {
    this.add = add;
    this.query = query;

    function add(student, callback) {
        let {id:sid, tid, pid} = student;

        var md5 = crypto.createHash('md5');
        let rawId = md5.update(String(pid) + String(tid) + String(sid) ).digest('base64');
        console.log(student);
        const sql = 'SELECT ' +
            'p.id, ' +
            'p.unit_count, ' +
            'p.unit_seed_count, ' +
            'sa.voted_count, ' +
            'sa_c.student_count ' +
            'FROM ' +
            'projects p ' +
            'LEFT JOIN ( SELECT count( * ) AS voted_count, pid FROM students_association WHERE pid = ' +pid+ ' AND sid = \''+sid+'\' ) sa ON sa.pid = p.id ' +
            'LEFT JOIN ( SELECT COUNT( * ) AS student_count, pid FROM students_association WHERE pid = ' + pid + ' AND tid = ' + tid + ' ) sa_c ON sa_c.pid = p.id ' +
            'WHERE ' +
            'p.id =' + pid;
        connection.query(sql, function (err, result) {
            if(err) {
                // next(err);
                callback(err);
            } else {
                console.log(result);
                let {id:pid, unit_count:teacherLimitCount, unit_seed_count:studentLimitCount, voted_count:votedCount, student_count:studentCount  } = result[0];
                if(votedCount === undefined || votedCount === null) {
                    votedCount = 0;
                }
                if(studentCount === undefined || studentCount === null) {
                    studentCount = 0;
                }

                if(votedCount >=  studentLimitCount) {
                    // 投票已达上限
                    var internalErr = new Error('投票次数已达上限.');
                    internalErr.code = 0x1001;
                    callback(internalErr);
                    return;
                }
                if(teacherLimitCount != 0 && studentCount>=teacherLimitCount) {
                    // 老师名下 学生数已达上限
                    var internalErr = new Error('学生名额已满, 请换个老师投票.');
                    internalErr.code = 0x1002;
                    callback(internalErr);
                    return;
                }



                let values = [[ student.id, student.name, student.phone, student.email, student.company, student.department, student.post]];
                let sql = 'insert into ' + tableName + '(' + field_id + ',' + field_name + ',' + field_phone + ',' + field_email + ',' + field_company + ',' + field_department + ',' + field_post + ') values ?'
                    + ' on duplicate key update email = values(email), company = values(company), department = values(department), post = values(post)';
                connection.query(sql, [values], function (err) {
                    if(err) {
                        callback(err);
                    } else {

                        let values = [[rawId, pid, tid, sid]];
                        connection.query('insert into students_association (id, pid, tid, sid) values ?', [values], function (err) {
                            if(err) {
                                if (err.code === 'ER_DUP_ENTRY') {
                                    // 已经投过该老师;
                                    // 在投票次数为非1的情况下触发
                                    var internalErr = new Error('已投过该老师.');
                                    internalErr.code = 0x1003;
                                    callback(internalErr);
                                } else {
                                    callback(err);
                                }
                            } else {
                                callback(null);
                            }

                        });
                    }
                });
            }
        });



        // let values = [ student.id, student.name, student.phone, student.email, student.company, student.department, student.post];
        // let sql = 'insert into ' + tableName + '(' + field_id + ',' + field_name + ',' + field_phone + ',' + field_email + ',' + field_company + ',' + field_department + ',' + field_post + ') values ?';
        // connection.query(sql, values, callback);
    };

    function query(sql, callback) {
        connection.query(sql, callback);
    }

}

module.exports = studentDao;