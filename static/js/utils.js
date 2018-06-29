// 删除前确认信息
function del() {
    var msg = "您真的确定要删除吗？\n\n请确认！";
    if (confirm(msg)==true){
        return true;
    }else{
        return false;
    }
}

// 导航栏的选中
$(function () {
    console.log(window.location.pathname)
    switch (window.location.pathname) {
        case ("/projects/list"):
            $(".list-group-item.nav-projects-list").css({
                "background":"#ccc"
            })
            break;
        case "/teachers/queryAllByPid":
            $(".list-group-item.nav-projects-list").css({
                "background":"#ccc"
            })
            break;
        case "/projects/edit":
            $(".list-group-item.nav-projects-list").css({
                "background":"#ccc"
            })
            break;
        case "/projects/chooseTeacher":
            $(".list-group-item.nav-projects-list").css({
                "background":"#ccc"
            })
            break;
        case "/projects/add":
            $(".list-group-item.nav-projects-add").css({
                "background":"#ccc"
            })
            break;
        case "/teachers/listPage":
            $(".list-group-item.nav-teachers-list").css({
                "background":"#ccc"
            })
            break;
        case "/teachers/listPage/":
            $(".list-group-item.nav-teachers-list").css({
                "background":"#ccc"
            })
            break;
        case "/teachers/edit":
            $(".list-group-item.nav-teachers-list").css({
                "background":"#ccc"
            })
            break;
        case "/teachers/add":
            $(".list-group-item.nav-teachers-add").css({
                "background":"#ccc"
            })
            break;
        default:
            break;
    }
})


/**
 * 导出Excel-------begin
 */
var idTmr;
function  getExplorer() {
    var explorer = window.navigator.userAgent ;
    //ie
    if (explorer.indexOf("MSIE") >= 0) {
        return 'ie';
    }
    //firefox
    else if (explorer.indexOf("Firefox") >= 0) {
        return 'Firefox';
    }
    //Chrome
    else if(explorer.indexOf("Chrome") >= 0){
        return 'Chrome';
    }
    //Opera
    else if(explorer.indexOf("Opera") >= 0){
        return 'Opera';
    }
    //Safari
    else if(explorer.indexOf("Safari") >= 0){
        return 'Safari';
    }
}
function method1(tableid) {//整个表格拷贝到EXCEL中
    if(getExplorer()=='ie')
    {
        var curTbl = document.getElementById(tableid);
        var oXL = new ActiveXObject("Excel.Application");

        //创建AX对象excel
        var oWB = oXL.Workbooks.Add();
        //获取workbook对象
        var xlsheet = oWB.Worksheets(1);
        //激活当前sheet
        var sel = document.body.createTextRange();
        sel.moveToElementText(curTbl);
        //把表格中的内容移到TextRange中
        sel.select();
        //全选TextRange中内容
        sel.execCommand("Copy");
        //复制TextRange中内容
        xlsheet.Paste();
        //粘贴到活动的EXCEL中
        oXL.Visible = true;
        //设置excel可见属性

        try {
            var fname = oXL.Application.GetSaveAsFilename("Excel.xlsx", "Excel Spreadsheets (*.xlsx), *.xlsx");
        } catch (e) {
            print("Nested catch caught " + e);
        } finally {
            oWB.SaveAs(fname);

            oWB.Close(savechanges = false);
            //xls.visible = false;
            oXL.Quit();
            oXL = null;
            //结束excel进程，退出完成
            //window.setInterval("Cleanup();",1);
            idTmr = window.setInterval("Cleanup();", 1);

        }

    }
    else
    {
        tableToExcel('ta');
    }
}
function Cleanup() {
    window.clearInterval(idTmr);
    CollectGarbage();
}
var tableToExcel = (function() {
    var uri = 'data:application/vnd.ms-excel;base64,',
        template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table>{table}</table></body></html>',
        base64 = function(s) { return window.btoa(unescape(encodeURIComponent(s))) },
        format = function(s, c) {
            return s.replace(/{(\w+)}/g,
                function(m, p) { return c[p]; }) }
    return function(table, name) {
        if (!table.nodeType) table = document.getElementById(table)
        var ctx = {worksheet: name || 'Worksheet', table: table.innerHTML}
        window.location.href = uri + base64(format(template, ctx))
    }
})();
/**
 * 导出Excel-------end
 */




var Max_Size = 100; //100k
var Max_Width = 800; //400px
var Max_Height = 800; //400px

function dealIcon() {
    var fileEl = document.getElementById('icon')

    console.log(fileEl.files);

    testType(fileEl);
    testMaxSize(fileEl);
    testWidthHeight(fileEl);
}

function testType(file) {
    if(file.files && file.files[0]){
        var fileData = file.files[0];

        var imgtype = fileData.name.toLowerCase().split('.');

        isAllow = (imgtype[1]) == "png" || (imgtype[1]) == "jpeg" || (imgtype[1]) == "bmp" || (imgtype[1]) == "jpg";

        showTip3(isAllow);
    }
}

function testMaxSize(file){
    if(file.files && file.files[0]){
        var fileData = file.files[0];

        var size = fileData.size;   //注意，这里读到的是字节数
        var isAllow = false;
        if(!size) isAllow = false;

        var maxSize = Max_Size;
        maxSize = maxSize * 1024;   //转化为字节
        isAllow = size <= maxSize;

        showTip1(isAllow);
    }

}

function testWidthHeight(file){
    var isAllow = false;

    if(file.files && file.files[0]){
        var fileData = file.files[0];

        //读取图片数据
        var reader = new FileReader();
        reader.onload = function (e) {
            var data = e.target.result;
            //加载图片获取图片真实宽度和高度
            var image = new Image();
            image.onload=function(){
                var width = image.width;
                var height = image.height;
                isAllow = width <= Max_Width && height <= Max_Height;
                showTip2(isAllow);
            };
            image.src= data;
        };
        reader.readAsDataURL(fileData);
    }

}
function showTip1(isAllow){
    if(isAllow){
        console.log("大小通过")
    }else{
        alert('大小未通过，要求'+ Max_Size + 'k以内');
        $("#icon").val("");
    }
}
function showTip2(isAllow){
    if(isAllow){
        console.log("宽高通过")
    }else{
        alert('宽高未通过，要求width:'+ Max_Width +'px, height:'+ Max_Height + 'px');
        $("#icon").val("");
    }
}
function showTip3(isAllow){
    if(isAllow){
        console.log("格式通过")
    }else{
        alert('格式未通过');
        $("#icon").val("");
    }
}