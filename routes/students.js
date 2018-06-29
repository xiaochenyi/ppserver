var express = require('express');
var crypto = require('crypto');
var router = express.Router();

var studentsDB = require('../src/db/studentsDao');
var studentsDao = new studentsDB();

/* GET users listing. */
router.use('/', function (req, res, next) {
    next();
}, function (req, res, next) {

    next('route');
});

router.get('/list', function (req, res, next) {
    res.json({1:2})
});


router.post('/commit', function (req, res, next) {
    let user = req.body;


    let {name, phone, email, company, department, post, tid, pid} = user;
    if (!(name && phone && email && company && department && tid && pid)) {
        res.transmitter.sendJson(0, res.msgCode.MSG_FAILED, res.msgCode.MSG_FAILED_NO_PARAMS);
    } else {

        var md5 = crypto.createHash('md5');
        user.id = md5.update(name + phone).digest('base64');

        studentsDao.add(user, function (err, result) {
             if(err) {
                 if(err.code >= 0x1001 && err.code <=0x1010) {
                     res.transmitter.sendJson(0, err.message, '');
                 } else {
                     res.status(500).send();
                 }
            } else {
                res.transmitter.sendJson();
            }
        })
    }
});


module.exports = router;
