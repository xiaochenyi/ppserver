var express = require('express');
var router = express.Router();
var fs = require('fs');
var multiparty = require('multiparty');

var teachInfo = require('../src/db/teachInfoDao');
var teachDao = new teachInfo();

router.use('/', function (req, res, next) {
    next();
})


// router.post('/add', function (req, res, next) {
//     let {name, introduction} = req.body;
//     if (!(name && introduction)) {
//         res.transmitter.sendJson(1, res.msgCode.MSG_FAILED, res.msgCode.MSG_FAILED_NO_PARAMS);
//         return;
//     }
//     teachDao.insert(req.body, function (err, result) {
//         if (err) {
//             res.status(500).send();
//         } else {
//             res.redirect('/teachers/listPage')
//             // res.transmitter.sendJson();
//         }
//     })
//     // res.status(200).json({code:1, msg:"Succeed", data:{user:user}});
//
// });

router.post('/add', function(req, res, next) {
    var form = new multiparty.Form();
    form.uploadDir = 'upload'; //上传图片保存的地址 目录必须存在
    // 获取表单提交的数据 以及post过来的图片
    form.parse(req, function (err, fileds, files) {
        var icon = files.icon[0].path;
        let a = {
            name : fileds.name[0],
            department : fileds.department[0],
            company : fileds.company[0],
            introduction : fileds.introduction[0],
            phone : fileds.phone[0],
            email : fileds.email[0],
            info: icon
        }
        if(a.name && a.introduction && files.icon[0].originalFilename) {
            teachDao.insert(a, function (err, result) {
                if (err) {
                    fs.unlink(icon);
                } else {
                    res.redirect('/teachers/listPage')
                }
            })
        }
    });
});

router.post('/edit', function(req, res) {
    var form = new multiparty.Form();
    form.uploadDir = 'upload'; //上传图片保存的地址 目录必须存在
    // 获取表单提交的数据 以及post过来的图片
    form.parse(req, function (err, fileds, files) {
        if(files.icon[0].originalFilename == '') {
            var icon = fileds.info[0];
            fs.unlink(files.icon[0].path);
        } else {
            var icon = files.icon[0].path;
        }
        let a = {
            name : fileds.name[0],
            department : fileds.department[0],
            company : fileds.company[0],
            introduction : fileds.introduction[0],
            phone : fileds.phone[0],
            email : fileds.email[0],
            info: icon,
            uid: fileds.uid[0]
        }
        if(a.name && a.introduction) {
            teachDao.updateUser(a, function (err, result) {
                if (err) {
                    fs.unlink(icon);
                } else {
                    res.redirect('/teachers/listPage')
                }
            })
        }
    });
});


// router.post('/edit', function (req, res, next) {
//     let {uid, name, introduction} = req.body;
//     if (!(uid && name && introduction)) {
//         res.transmitter.sendJson(1, res.msgCode.MSG_FAILED, res.msgCode.MSG_FAILED_NO_PARAMS);
//         return;
//     } else {
//         teachDao.updateUser(req.body, function (err, result) {
//             if (err) {
//                 res.status(500).send();
//             } else {
//                 // res.transmitter.sendJson();
//                 res.redirect('/teachers/listPage')
//             }
//         })
//     }
// });

router.post('/remove', function (req, res, next) {
    var {uid} = req.body;
    if (uid !== undefined && uid !== null) {
        teachDao.delete(uid, function (err) {
            if (err) {
                res.status(500).send();
            } else {
                res.transmitter.sendJson();
            }
        })
    } else {
        res.transmitter.sendJson(0, res.msgCode.MSG_FAILED, res.msgCode.MSG_FAILED_NO_PARAMS);
    }

});

router.post('/queryUsers', function (req, res, next) {
    var {currentPage = 1, pageCount = 10, pid} = req.body;
    if (!pid) {
        res.transmitter.sendJson(0, res.msgCode.MSG_FAILED, res.msgCode.MSG_FAILED_NO_PARAMS);
        return;
    }
    let sql = 'select ' +
        'count(*) as count ' +
        'from ' +
        'project_teacher_association ass ' +
        'inner join ' +
        'teach_info t_info ' +
        'on ass.pid =' + pid + ' and ass.tid = t_info.id';
    teachDao.query(sql, function (err, result) {
        if (err) {
            res.status(500).send();
        } else {
            const count = result[0].count;
            teachDao.queryUsers(pid, currentPage, pageCount, function (err, result) {
                if (err) {
                    res.status(500).send();
                } else {
                    res.transmitter.sendJsonData(result, currentPage, pageCount, count);
                }
            });
        }
    });

});

router.post('/queryUser', function (req, res, next) {
    var uid = req.body.uid;
    teachDao.queryUser(uid, function (err, result) {
        if (err) {
            res.status(500).send();
        } else {
            res.transmitter.sendJsonData({user: result[0]})
        }
    });

});


/**
 * 根据pid & tid 返回教师详情
 * params:
 *          - tid  教师ID 必填
 *          - pid  项目ID 必填
 *
 * Response Json:
 * {
    "code": 1,
    "msg": "操作成功",
    "data": {
        "user": {
            "id": 1,
            "name": "Vic",
            "introduction": "Vic Teacher",
            "info": ";)",
            "phone": null,
            "email": null,
            "company": null,
            "department": null,
            "post": null,
            "unit_count": 5,    // 老师的投票限制, 0:无上限
            "voted_count": 1    // 已投票次数
        }
    }
}
 */
router.post('/queryTeacherByPid', function (req, res, next) {
    var {tid, pid} = req.body;
    teachDao.queryUserByPid(tid, pid, function (err, result) {
        if (err) {
            res.status(500).send();
        } else {
            res.transmitter.sendJsonData({user: result[0]})
        }
    });

});

/**
 * 获取项目下所有的老师与学生信息
 * Params:
 *          - pid
 *
 * Response Json:
 * {
    "code": 1,
    "msg": "操作成功",
    "data": {
        "user": [
            {
                "pid": 2,
                "tid": 8,
                "teacher_name": "kevin004",
                "teacher_introduction": "男, 00年出生的年轻老师.",
                "teacher_phone": null,
                "teacher_email": null,
                "teacher_company": null,
                "teacher_department": null,
                "teacher_post": null,
                "stu_id": "atGBbE8f+8XOXLdFj5hDig==",
                "stu_name": "李庆帅",
                "stu_phone": "13800138000",
                "stu_email": "13800138000@126.com",
                "stu_company": "kdx",
                "stu_department": "3D东东",
                "stu_post": "master"
            },
            ...
            {
                "pid": 2,
                "tid": 9,
                "teacher_name": "kevin005",
                "teacher_introduction": "男, 00年出生的年轻老师.",
                "teacher_phone": null,
                "teacher_email": null,
                "teacher_company": null,
                "teacher_department": null,
                "teacher_post": null,
                "stu_id": null,
                "stu_name": null,
                "stu_phone": null,
                "stu_email": null,
                "stu_company": null,
                "stu_department": null,
                "stu_post": null
            }
        ]
    }
}
 */
router.post('/queryAllByPid', function (req, res, next) {
    var {pid} = req.body;
    teachDao.queryAllByPid(pid, function (err, result) {
        if (err) {
            res.status(500).send();
        } else {
            res.transmitter.sendJsonData({user: result})
        }
    });
});

router.get('/queryAllByPid', function (req, res, next) {
    var {pid} = req.query;
    teachDao.queryAllByPid(pid, function (err, result) {
        if (err) {
            res.status(500).send();
        } else {
            res.render('admin/project/teacherStudent', {
                list: result
            })
        }
    });
});


// 导师列表页
router.get('/listPage', function (req, res, next) {
    var {currentPage = 1, pageCount = 10} = req.query;

    teachDao.query('select count(*) as count from teach_info', function (err, result) {
        if (err) {
            next(err);
        } else {
            const count = result[0].count;
            teachDao.queryUsersAll(currentPage, pageCount, function (err, result) {
                if (err) {
                    next(err);
                } else {
                    res.render('admin/teacher/list', {
                        list: result,
                        totalCount: count,
                        size: pageCount,
                        currentPage: currentPage
                    })
                }
            });
        }
    });
});

// 导师添加页
router.get('/add', function (req, res) {
    res.render('admin/teacher/add')
});

// 导师修改页
router.get('/edit', function (req, res, next) {
    var id = req.query.id;
    teachDao.queryUser(id, function (err, result) {
        if (err) {
            res.status(500).send();
        } else {
            res.render('admin/teacher/edit', {
                list: result[0]
            })
            // res.transmitter.sendJsonData({user: result[0]})
        }
    });

});

// 删除
router.get('/remove', function (req, res, next) {
    var {uid} = req.query;
    if (uid !== undefined && uid !== null) {
        teachDao.delete(uid, function (err) {
            if (err) {
                next(err)
            } else {
                res.redirect('/teachers/listPage')
            }
        })
    } else {
    }

});


module.exports = router;
