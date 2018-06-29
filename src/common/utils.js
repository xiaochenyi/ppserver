var myFunction = {};

/*
 * 日期格式化
 * 返回值格式：2015-03-19 12:00：00
 */
myFunction.formatDateTime = function(date) {
    var y = date.getFullYear();
    var m = date.getMonth() + 1;
    m = m < 10 ? ('0' + m) : m;
    var d = date.getDate();
    d = d < 10 ? ('0' + d) : d;
    var h = date.getHours();
    h=h < 10 ? ('0' + h) : h;
    var minute = date.getMinutes();
    minute = minute < 10 ? ('0' + minute) : minute;
    var second=date.getSeconds();
    second=second < 10 ? ('0' + second) : second;
    return y + '-' + m + '-' + d+' '+h+':'+minute+':'+second;
},

/*
 * 状态（0下线 1上线）
 */
myFunction.getStatus = function(val) {
    if(val == '1') {
        return "上线"
    } else if(val == '0') {
        return "下线"
    }
}

module.exports = myFunction;

