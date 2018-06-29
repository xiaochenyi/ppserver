
class HttpResponseTools {
    constructor(req, res) {
        Object.assign(this, {req, res});
    }

    sendJson(code = 1, msg = this.res.msgCode.MSG_SUCCEED, internalMsg = '') {
        const result = {code:code, msg:msg, internalMsg:internalMsg};
        this.res.json(result);
    }

    sendJsonData(data, curPage, pageCount, totalCount) {
        const result = {code:1, msg:this.res.msgCode.MSG_SUCCEED};
        if(data) {
            if (Array.isArray(data)) {
                result.list = data;
                if(curPage) {
                    result.currentpage = curPage;
                }
                if(totalCount) {
                    result.total = totalCount;
                }
                if(result.currentpage && result.total) {
                    result.next = curPage * pageCount <= totalCount;
                }
            } else {
                result.data = data;
            }
        }
        this.res.json(result);
    }


}

export default HttpResponseTools;