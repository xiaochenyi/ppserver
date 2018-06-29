var database = require('./database');
var connection = database.connect;
var tableName = 'teach_info';
var field_id = 'id';
var field_name = 'name';
var field_intro = 'introduction';
var field_info = 'info';
var field_phone = 'phone';
var field_email = 'email';
var field_company = 'company';
var field_department = 'department';
var field_post = 'post';


function teachInfo() {
    this.insert = insert;

    function insert(user, callback) {
        let {name, introduction, info = '', phone = '', email='', company = '', department = '', post = ''} = user;
        let values = [[name, introduction, info, phone, email, company, department, post]];
        connection.query('insert into ' + tableName + '(' + field_name + ',' + field_intro + ',' + field_info +',' + field_phone +',' + field_email + ',' + field_company + ',' + field_department + ',' + field_post + ') ' +
            'values ?', [values], function (err) {
            callback(err);
        })
    }

    this.updateUser = updateUser;

    function updateUser(user, callback) {
        let {name, introduction, info = '', phone = '', email='', company = '', department = '', post = ''} = user;
        connection.query('update ' + tableName + ' SET ' +
            field_name + '=\'' + name + '\', ' +
            field_intro + '=\'' + introduction + '\', ' +
            field_info + '=\'' + info + '\', ' +
            field_phone + '=\'' + phone + '\', ' +
            field_email + '=\'' + email + '\', ' +
            field_company + '=\'' + company + '\', ' +
            field_department + '=\'' + department + '\', ' +
            field_post + '=\'' + post + '\' ' +
            'where ' + field_id + '=' + user.uid, function (err, result) {
            callback(err, result);
        });
    }

    this.delete = deleteUser;

    function deleteUser(uid, callback) {
        connection.query('delete from ' + tableName + ' where ' + field_id + '=' + uid, function (err) {
            callback(err);
        });
    }

    this.query = query;

    function query(sql, callback) {
        connection.query(sql, function (err, result) {
            callback(err, result);
        });
    }

    this.queryUsers = queryUsers;

    function queryUsers(pid, currentPage, pageCount, callback) {
        let sql = 'select ' +
            't_info.* ' +
            'from ' +
            'project_teacher_association ass ' +
            'inner join ' +
            'teach_info t_info ' +
            'on ass.pid =' + pid + ' and ass.tid = t_info.id limit ' + pageCount + ' offset ' + (currentPage - 1) * pageCount;
        //var sql = 'select * from teach_info limit ' + pageCount + ' offset ' + (currentPage - 1) * pageCount;
        connection.query(sql, function (err, result) {
            callback(err, result);
        });
    }

    this.queryUsersAll = queryUsersAll;

    function queryUsersAll(currentPage, pageCount, callback) {
        var sql = 'select * from teach_info ORDER BY id DESC limit ' + pageCount + ' offset ' + (currentPage - 1) * pageCount ;
        connection.query(sql, function (err, result) {
            callback(err, result);
        });
    }

    this.queryUser = queryUser;

    function queryUser(uid, callback) {
        var sql = 'select * from teach_info where id=' + uid;
        connection.query(sql, function (err, result) {
            callback(err, result);
        });
    }

    this.queryUserByPid = queryUserByPid;

    function queryUserByPid(tid, pid, callback) {
        var sql = 'select t.*, p.unit_count, sa.voted_count ' +
            'FROM project_teacher_association pta ' +
            'INNER JOIN teach_info t on t.id = pta.tid ' +
            'INNER JOIN projects p on p.id = pta.pid ' +
            'INNER JOIN (SELECT count(*) as voted_count from students_association where pid = '+pid+' and tid = '+tid+') sa ' +
            'where pta.pid = '+pid+' and pta.tid = '+tid;
        connection.query(sql, function (err, result) {
            callback(err, result);
        });
    }

    this.queryAllByPid = queryAllByPid;

    function queryAllByPid(pid, callback) {
        // var sql = 'SELECT ' +
        //     'ass.pid as pid, ' +
        //     't_info.id as tid, ' +
        //     't_info.name as teacher_name, ' +
        //     't_info.introduction as teacher_introduction, ' +
        //     't_info.phone as teacher_phone, ' +
        //     't_info.email as teacher_email, ' +
        //     't_info.company as teacher_company, ' +
        //     't_info.department as teacher_department, ' +
        //     't_info.post as teacher_post, ' +
        //     'stu.id as stu_id, ' +
        //     'stu.name as stu_name, ' +
        //     'stu.phone as stu_phone, ' +
        //     'stu.email as stu_email, ' +
        //     'stu.company as stu_company, ' +
        //     'stu.department as stu_department, ' +
        //     'stu.post as stu_post ' +
        //     'FROM ' +
        //     '( SELECT tid, pid FROM project_teacher_association WHERE pid = '+pid+' ) ass ' +
        //     'LEFT JOIN teach_info t_info ON ass.tid = t_info.id ' +
        //     'LEFT JOIN students_association sa ON sa.tid = ass.tid ' +
        //     'LEFT JOIN seeds stu ON stu.id = sa.sid';
        var sql = 'select * FROM ' +
            '(select ' +
            't.id as tid, ' +
            't.name as teacher_name, ' +
            't.introduction as teacher_introduction, ' +
            't.phone as teacher_phone, ' +
            't.email as teacher_email, ' +
            't.company as teacher_company, ' +
            't.department as teacher_department, ' +
            't.post as teacher_post ' +
            'from teach_info t,project_teacher_association p ' +
            'WHERE t.id = p.tid and  pid=' + pid + ')  as teacher ' +

            'LEFT JOIN ' +

            '(SELECT ' +
            'u.tid as tid, ' +
            'e.id as stu_id, ' +
            'e.name as stu_name, ' +
            'e.phone as stu_phone, ' +
            'e.email as stu_email, ' +
            'e.company as stu_company, ' +
            'e.department as stu_department, ' +
            'e.post as stu_post ' +
            'from seeds e, students_association u ' +
            'WHERE e.id = u.sid and pid=' + pid + ') as stu ' +

            'on teacher.tid = stu.tid ' +

            'ORDER BY teacher.tid';


        console.log(sql);
        connection.query(sql, function (err, result) {
            callback(err, result);
        });
    }
}


module.exports = teachInfo;