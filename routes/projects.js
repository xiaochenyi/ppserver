var express = require('express');
var router = express.Router();


var projects = require('../src/db/projectsDao');
var teacher = require('../src/db/teachInfoDao');
var projectsDao = new projects();
var teachInfoDao = new teacher();


// 项目列表页
router.get('/list', function (req, res, next) {
    projectsDao.list(1, 100, function (err, result) {
        if (err) {
            next(err);
        } else {
            res.render('admin/project/list', {
                list: result,
                currentPage: 1,
                pageCount: 100,
                count:100
            });
        }
    });
});
// 添加项目页
router.get('/add', function(req, res) {
    res.render('admin/project/add');
});
// 修改项目页
router.get('/edit', function(req, res) {
    var id = req.query.id;
    projectsDao.query('select * from projects where id=' + id, function (err, result) {
        if(err) {
            next(err);
        } else {
            res.render('admin/project/edit', {
                id: id,
                info: result[0]
            });
        }
    });
});
// 项目对应的导师+学生列表
router.get('/ptlist', function(req, res) {
    res.render('admin/project/teacherStudent', {
        list: []
    })
});

// 添加项目
router.post('/add', function (req, res, next) {
    var project = packageProject(req);
    if (project.name == undefined || project.name == null) {
        res.transmitter.sendJson(0, res.msgCode.MSG_FAILED, res.msgCode.MSG_FAILED_NO_PARAMS);
        return;
    }
    projectsDao.add(project, function (err, result) {
        if (err) {
            next(err)
        } else {
            //res.json({code:1, msg:codeMsg.MSG_SUCCEED});
            //res.transmitter.sendJson();
            res.redirect('/projects/chooseTeacher?pid=' + result.insertId)
        }
    });
});
// 添加完项目选择导师页
router.get('/chooseTeacher', function(req, res, next) {
    var pid = req.query.pid;

    teachInfoDao.query('select * from teach_info where id not in (select tid from project_teacher_association where pid= ' + pid + ')', function (err, result) {
        if(err) {
            next(err);
        } else {
            res.render('admin/project/choose', {
                list: result,
                pid: pid
            });
        }
    });
});
// 该项目下 添加导师 提交
router.post('/doChoose', function(req, res) {
    var pid = req.body.pid;
    var checkId = req.body.checkId;
    projectsDao.bindTeachers(pid, checkId, function (err) {
        if(err) {
            next(err);
        } else {
            res.redirect('/projects/list')
        }
    });
});

// 删除按钮
router.get('/remove', function (req, res, next) {
    var id = req.query.pid;
    if (id === undefined || id === null) {
        res.transmitter.sendJson(0, res.msgCode.MSG_FAILED, res.msgCode.MSG_FAILED_NO_PARAMS);
        return;
    }
    projectsDao.remove(id, function (err) {
        if (err) {
            res.status(500).send();
        } else {
            res.redirect('/projects/list')
        }
    });
});


router.post('/edit', function (req, res, next) {
    var id = req.body.pid;
    if (id == undefined || id == null) {
        res.transmitter.sendJson(0, res.msgCode.MSG_FAILED, res.msgCode.MSG_FAILED_NO_PARAMS);
        return;
    }
    var project = packageProject(req);
    project.id = id;
    project.name = req.body.name;

    projectsDao.edit(project, function (err) {
        if (err) {
            res.status(500).send();
        } else {
            if (req.headers['x-requested-with'] && req.headers['x-requested-with'].toLowerCase() == 'xmlhttprequest') {
                res.transmitter.sendJson();
            } else {
                res.redirect('/projects/list')
            }
        }
    });
});

function packageProject(req) {

    var projects = {};
    projects.name = req.body.name;
    projects.status = req.body.status;// default close
    projects.unitCount = req.body.unit_count;
    projects.unitSeedCount = req.body.unit_seed_count;
    if (projects.unitCount === undefined || projects.unitCount === null || projects.unitCount < 0) {
        projects.unitCount = 0; // default 0, no limit
    }

    if (projects.unitSeedCount === undefined || projects.unitSeedCount === null || projects.unitCount <= 0) {
        projects.unitSeedCount = 1; // default 1, only once;
    }
    if (projects.status === undefined || projects.status === null) {
        projects.status = 0;
    }
    return projects;
}


router.post('/bindTeachers', function (req, res, next) {
    let {ids} = JSON.parse(req.body.tidList);
    let pid = req.body.pid;
    if(!(req.body.tidList && pid)) {
        res.transmitter.sendJson(0, res.msgCode.MSG_FAILED, res.msgCode.MSG_FAILED_NO_PARAMS);
        return;
    }
    projectsDao.bindTeachers(pid, ids, function (err) {
        if(err) {
            next(err);
        } else {
            res.transmitter.sendJson();
        }
    });
});

router.post('/remove', function (req, res, next) {
    var id = req.body.pid;
    if (id === undefined || id === null) {
        res.transmitter.sendJson(0, res.msgCode.MSG_FAILED, res.msgCode.MSG_FAILED_NO_PARAMS);
        return;
    }
    projectsDao.remove(id, function (err) {
        if (err) {
            res.status(500).send();
        } else {
            res.transmitter.sendJson();
        }
    });
});

router.post('/list', function (req, res, next) {
    var {currentPage = 1, pageCount = 10} = req.body;
    projectsDao.query('select count(*) as count from ' + projectsDao.tableName, function (err, result) {
        if (err) {
            res.status(500).send();
        } else {
            const count = result[0].count;
            projectsDao.list(currentPage, pageCount, function (err, result) {
                if (err) {
                    res.status(500).send();
                } else {
                    res.transmitter.sendJsonData(result, currentPage, pageCount, count);
                }
            });
        }
    });
});

router.post('/listByTid', function (req, res, next) {
    var {currentPage = 1, pageCount = 10} = req.body;
    projectsDao.query('select count(*) as count from ' + projectsDao.tableName, function (err, result) {
        if (err) {
            res.status(500).send();
        } else {
            const count = result[0].count;
            projectsDao.list(currentPage, pageCount, function (err, result) {
                if (err) {
                    res.status(500).send();
                } else {
                    res.transmitter.sendJsonData(result, currentPage, pageCount, count);
                }
            });
        }
    });
});

router.post('/queryNameByPid', function (req, res, next) {
    var id = req.body.pid;
    if (id === undefined || id === null) {
        res.transmitter.sendJson(0, res.msgCode.MSG_FAILED, res.msgCode.MSG_FAILED_NO_PARAMS);
        return;
    }
    projectsDao.queryNameByPid(id, function (err, result) {
        if (err) {
            res.status(500).send();
        } else {
            res.transmitter.sendJsonData({project: result[0]})
        }
    });
});

module.exports = router;