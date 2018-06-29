import httpUtil from '../common/httputil.js';
let msgCode = require('../common/httpcode');

function utils(req, res, next) {
    const httpResult = new httpUtil(req, res);
    res.transmitter = httpResult;
    res.msgCode = msgCode;
    next();
}

module.exports = utils;