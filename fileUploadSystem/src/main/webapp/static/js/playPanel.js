/*
 * Copyright (C) 2017 TOSHIBA CORPORATION, All Rights Reserved.
 *
 */

/*
* 秒を時分秒形式(hh:mm:ss)文字列に変換
*/
function toHms(sec) {
    sec = Math.round(sec);//四捨五入
    function padZero(v) {
        if (v < 10) {
            return "0" + v;
        } else {
            return v;
        }
    }
    var hms = "";
    var h = sec / 3600 | 0;
    var m = sec % 3600 / 60 | 0;
    var s = sec % 60;
    return padZero(h) + ":" + padZero(m) + ":" + padZero(s);
}


/**
 * 再生領域読み込み処理
 */
function initPlayer() {
    /**
     * タイマーインターバル（長押し用）
     * @type {number}
     */
    var TIMER_INTERVAL = 100;
    var timerId;//タイマーID
    var timerRun = false;//再生フラグ
    var volumeSlider = null;
    var self = this;

    /**
     * タイムラインポジション変更イベント
     * @param timeIdx タイムスタンプインデックスリストに対するインデックス
     */
    function onTimePosChanged(newTime){
        //時刻パネル更新
        $('#time-label').text(toHms(newTime));
        //タイムライン更新
        $('#timelineArea').timeline('setPlayPos',newTime);
    };

    /**
     * ボタン状態変更
     * @param bPlay true:再生中、false:停止中
     */
    function changeBtnState(bPlay){
        if(bPlay){
            $('#span-play-play').removeClass('glyphicon-play');
            $('#span-play-play').addClass('glyphicon-pause');
            $('#btn-play-play').attr('title',"一時停止");
        }
        else{
            $('#span-play-play').removeClass('glyphicon-pause');
            $('#span-play-play').addClass('glyphicon-play');
            $('#btn-play-play').attr('title',"再生");
        }
    };

	// ビデオプレイヤー作成
	$('#movie-panel').videoplayer({
		src:movieInfo.url,
		videoWidth:movieInfo.videoWidth,
		videoHeight:movieInfo.videoHeight,
		duration:movieInfo.duration,
        onPlay:function(e){
            //動画再生イベント
            timerRun = true;
            timerId = setTimeout(function () {
                playTimer();
            }, TIMER_INTERVAL);
            changeBtnState(true);
        },
        onPause:function(e){
            //動画停止イベント
            timerRun = false;
            clearTimeout(timerId);
            changeBtnState(false);
        },
        onVolumeChange:function(e){
            //音量変更イベント
            var vol = $('#movie-panel').videoplayer('getVolume');
            vol = Math.floor(vol * 100) / 100;
            var muted = $('#movie-panel').videoplayer('getMuted');
            if(muted){
                vol = 0;
            }
            toggleVolumeBtn(vol);
            var curVol = volumeSlider.bootstrapSlider('getValue');
            if(curVol != vol){
                volumeSlider.bootstrapSlider('setValue',vol);
            }
        },
        onLoadMeta:function(e){
            //再生時間初期化
            var duration = $('#movie-panel').videoplayer('getDuration');
            $('#timelineArea').timeline('setMaxTime', duration);
            //ソース名初期化
            var src = $('#movie-panel').videoplayer('getSrc');
            var path = src.split('/');
            $('#file-name-label').text(path[path.length-1]);
        },
        onCanplayThrough:function(e){
            //検索ボタンを有効に
            // TODO $('#searchButton').prop('disabled', false);
        },
        onError:function(e){
            dispAlert(alerts[3].type, "動画のロードに失敗しました。");
        }
	});

    //音量ボタンアイコン変更
    function toggleVolumeBtn(vol){
        $('#span-volume').removeClass('glyphicon-volume-up');
        $('#span-volume').removeClass('glyphicon-volume-off');
        if(vol == 0){
            $('#span-volume').addClass('glyphicon-volume-off');
        }
        else{
            $('#span-volume').addClass('glyphicon-volume-up');
        }
    }
    //音量初期化
    var vol = $('#movie-panel').videoplayer('getVolume');
    toggleVolumeBtn(vol);
    //音量スライダー作成
    volumeSlider = $("#volume-slider").bootstrapSlider({
        tooltip:"hide",
        min:0,
        max:1.0,
        step:0.01,
        reversed:true,
        value:vol
    }).on("change", function(e){
        toggleVolumeBtn(e.value.newValue);
        //音量更新
        var vol = $('#movie-panel').videoplayer('getVolume');
        var muted = $('#movie-panel').videoplayer('getMuted');
        if(vol != e.value.newValue){
            if(muted && e.value.newValue > 0){
                $('#movie-panel').videoplayer('setMuted', false); //ミュート解除
            }
            $('#movie-panel').videoplayer('setVolume', e.value.newValue);
        }
    });

    // タイムライン作成(イベントハンドラセットのみ)
    $('#timelineArea').timeline({
        maxTime:movieInfo.duration,
        onTimeChanged:function(newTime){
            //動画更新
            newTime = $('#movie-panel').videoplayer('setPlayPos',newTime);
            //パネル・タイムライン更新
            onTimePosChanged(newTime);
        }
    });

    //再生タイマー
    function playTimer(){
        timerId = setTimeout(function(){
            if(timerRun) {
                var newTime = $('#movie-panel').videoplayer('getPlayPos');
                //パネル・タイムライン更新
                onTimePosChanged(newTime);
                //次のタイマー(再帰)
                timerId = setTimeout(function () {
                    playTimer();
                }, TIMER_INTERVAL);
            }
        }, TIMER_INTERVAL);
    };


    //1秒先へ
    $('#btn-step-forward').on('mousedown', function(e){
        var pos = $('#movie-panel').videoplayer('getPlayPos');
        var duration = $('#movie-panel').videoplayer('getDuration');
        if(pos < duration){
            if(!timerRun) {
                var newTime = Math.floor(pos+1);//切り捨て
                if(newTime > duration){
                    newTime = duration;
                }
                //動画更新
                newTime = $('#movie-panel').videoplayer('setPlayPos',newTime);
                //パネル・タイムライン更新
                onTimePosChanged(newTime);
            }
        }
    });
    //1秒戻る
    $('#btn-step-backward').on('mousedown', function(e){
        var pos = $('#movie-panel').videoplayer('getPlayPos');
        if(pos > 0){
            if(!timerRun) {
                var newTime = Math.floor(pos-1);//切り捨て
                if(newTime < 0){
                    newTime = 0;
                }
                //動画更新
                newTime = $('#movie-panel').videoplayer('setPlayPos',newTime);
                //パネル・タイムライン更新
                onTimePosChanged(newTime);
            }
        }
    });
    //次の検索結果
    $('#btn-fast-forward').on('click', function(e){
        $('#timelineArea').timeline('searchNext');
    });
    //前の検索結果
    $('#btn-fast-backward').on('click', function(e){
        $('#timelineArea').timeline('searchPrev');
    });
    //再生・停止
    $('#btn-play-play').on('click', function(e){
        if(!timerRun) {
            $('#movie-panel').videoplayer('play');
        }
        else{
            $('#movie-panel').videoplayer('pause');
        }
    });

    //再生設定パネル
    $('#check-volume').on('change', function(e){
        if ($(this).is(':checked')) {
            $('.play-volume-panel').show('fade');
        }
        else{
            $('.play-volume-panel').hide('fade');
        }
    });

    //動画領域のサイズ調整
    $('#movie-panel').videoplayer('resiseToFit');
    $( window ).resize(function() {
        $('#movie-panel').videoplayer('resiseToFit');
    });
}