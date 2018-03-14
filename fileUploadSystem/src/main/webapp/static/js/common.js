/*
 * Copyright (C) 2017 TOSHIBA CORPORATION, All Rights Reserved.
 *
 */
// Javascript共通変数
/** 動画情報 */
var movieInfo = null;
/** フレーム情報 */
//var frameList = null;
var frameList = {
	"frames":[
		{"begin":145,"end":290},
		{"begin":435,"end":580},
		{"begin":725,"end":870},
		{"begin":1015,"end":1160},
		{"begin":1305,"end":1450},
		{"begin":1595,"end":1740},
		{"begin":1885,"end":2030},
		{"begin":2175,"end":2320},
		{"begin":2465,"end":2610}
	]
};

/**
 * ajax
 */
function runAjaxPost(url, type, data, isUpload) {
	//キャッシュ抑制
	var time = new Date().getTime();
	if (url.indexOf("?") != -1) {
		url += "&" + time;
	} else {
		url += "?" + time;
	}
	//Ajax
	var ajaxResult = $.ajax({
		url : url,
		type : type,
		data : data,
		cache : false,
		processData: !isUpload,
		contentType: !isUpload,
		dataType : "json"
	});
	return ajaxResult;
}

/**
 * Alert種別
 */
var alerts = [
	{ "type" : BootstrapDialog.TYPE_SUCCESS, "message" : "Success alert" },
	{ "type" : BootstrapDialog.TYPE_INFO, "message" : "Info alert" },
	{ "type" : BootstrapDialog.TYPE_WARNING, "message" : "Warning alert" },
	{ "type" : BootstrapDialog.TYPE_DANGER, "message" : "Danger alert" }
];
/**
 * Alert表示
 */
function dispAlert(alertType, message) {
    BootstrapDialog.alert({
    	title:"画像検索",
        type:alertType,
        message:message,
        closable : true,
        draggable: true,
        buttonLabel:'OK'
    });
};
