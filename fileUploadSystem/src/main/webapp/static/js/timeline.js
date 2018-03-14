/*
 * Copyright (C) 2016 TOSHIBA CORPORATION, All Rights Reserved.
 *
 */

(function($){
	/*
	 * widget定義
	 */
    $.widget('vw.timeline', {
		/*
		 * デフォルトオプション
		 */
        options: {
            scale: 1,					//スケール
            playPos: 0,					//カーソル位置
            onTimeChanged:null,			//カーソルドラッグ移動時のコールバック
            maxTime:0,					//最大時間（秒）
            //定数
            SCALE_PADDING:30,			//スケールの前後余白領域幅
            TIME_SCALE:60,				//目盛りの単位
            PIXEL_PER_SCALE:2,			//1目盛りあたりのピクセル数
            TIME_TEXT_HEIGHT:16,		//時刻文字の高さ
            TIME_TEXT_WIDTH:34,			//時刻文字の幅
            SCALE_IMAGE_HEIGHT:20,		//目盛りイメージの高さ
            CURSOR_IMAGE_WIDTH:11,		//カーソルイメージの幅
            CURSOR_IMAGE_HEIGHT:49,		//カーソルイメージの高さ
            BODY_TOP_HEIGHT:1,
            BODY_MID_HEIGHT:26,			//中間ブロックの高さ
            BODY_BOTTOM_HEIGHT:1,
            COLOR_TABLE_SCALE:0.2,		//カラーバーテーブルのスケール(20%)
            COLOR_TABLE:["#000","#ffe6e6","#ffc8c8","#ff9999","#ff6464","#f00"] //カラーバーの色定義テーブル
        },
		/*
		 * 初期化
		 */
        _init: function() {
            var self = this,
                opt = self.options;
            //タイムライン作成
            var timeline = this.timeline = self.element.prepend(self._timelineHtml());
            //スケール再計算
            self._recalcWidth();
            //音声カーソル作成
            self._createPlayCursol();
            //ドラッグ開始フラグ
            self.dragStart = false;
            //クリックイベント
            $('#timeline-body-block').bind('click', function(event){
                var x = (event.pageX - $(this).offset().left - Math.floor(opt.CURSOR_IMAGE_WIDTH/2) - opt.SCALE_PADDING);
                var t = Math.round(x / opt.PIXEL_PER_SCALE) * opt.scale;
                if(t < 0){
                    t = 0;
                }
                self.setPlayPos(t);
                //コールバック
                if(opt.onTimeChanged){
                    if(t >= opt.maxTime){
                        t = opt.maxTime;
                    }
                    opt.onTimeChanged(t);
                }
            });
            //カラーバーテーブル
            this.colorBarTable = [];
        },
		/*
		 * カーソル作成
		 */
        _createPlayCursol: function() {
            var self = this,
                opt = self.options;
            var body = $('#timeline-body-block-mid');
            var cur = $('<div class="timeline-play-cursor" id="timeline-play-cursor"/>')
                .appendTo(body )
                .width(opt.CURSOR_IMAGE_WIDTH)
                .height(opt.CURSOR_IMAGE_HEIGHT);
            //カーソル位置移動
            self._setPlayCursorPos();
            //ドラッグ可能にする
            cur.draggable({
                cursor:'pointer',				//カーソル種別
                axis:'x',						//X方向のみ
                containment:'parent',			//親要素内で
                grid:[opt.PIXEL_PER_SCALE,0],	//ドラッグ移動単位
                scroll: true,					//自動スクロール
                start: function(e, ui){			//ドラッグ開始イベント
                    self.dragStart = true;
                },
                stop: function(e, ui){			//ドラッグ終了イベント
                    self.dragStart = false;
                    if(ui && ui.position && ui.position.left >= 0){
                        var time = Math.floor((ui.position.left / opt.PIXEL_PER_SCALE) * opt.scale);
                        if(time < 0){
                            time = 0;
                        }
                        self.setPlayPos(time);
                        //コールバック
                        if(opt.onTimeChanged){
                            if(time >= opt.maxTime){
                                time = opt.maxTime;
                            }
                            opt.onTimeChanged(time);
                        }
                    }
                }
            });
        },
		/*
		 * 時刻文字表示部作成
		 */
        _createScaleTime: function() {
            var self = this,
                opt = self.options;

            //一旦削除
            $('.timeline-scale-time' ).remove();

            if(opt.maxTime == 0){
                return;
            }

            var block = $('#timeline-time-block');
            var frag = $(document.createDocumentFragment());
            var max = Math.floor(opt.maxTime / opt.scale) * opt.TIME_SCALE;
            var time,t,w,left,timeIdx;
            //時刻配置
            for(var i = 0; i <= max; i++){
                timeIdx = i * (opt.scale * opt.TIME_SCALE);
                if(timeIdx >= opt.maxTime){
                    break;
                }
                time = toHms(timeIdx);
                t = $("<div class='timeline-scale-time' id='timeline-scale-time" + i + "'>" + time + "</div>").appendTo(frag);
                w = opt.TIME_TEXT_WIDTH;
                left =  opt.SCALE_PADDING  + (i * opt.PIXEL_PER_SCALE * opt.TIME_SCALE) - Math.floor(w / 2);
                t.css('left', left);
            }
            //終了時刻
            var lstPos = left + opt.TIME_TEXT_WIDTH;
            max = Math.floor(opt.maxTime / opt.scale) * opt.PIXEL_PER_SCALE;
            left =  opt.SCALE_PADDING  + max - Math.floor(w / 2);
            time = toHms(opt.maxTime);
            if(left > lstPos){
                //余白があるので追加
                t = $("<div class='timeline-scale-time' id='timeline-scale-time" + i + "'>" + time + "</div>").appendTo(frag);
                t.css('left', left);
            }
            else{
                //余白がないので最後の目盛を最終時刻に変更
                t = $('#timeline-scale-time' + (i-1), frag);
                t.text(time);
                t.css('left', left);
            }
            frag.appendTo(block);
        },
		/*
		 * スケール領域作成
		 */
        _createScale: function(){
            var self = this,
                opt = self.options;

            //親領域
            var w = Math.ceil(opt.maxTime / opt.scale) * opt.PIXEL_PER_SCALE;
            var l = Math.floor(opt.CURSOR_IMAGE_WIDTH/2)
            var parent = $('#timeline-scale-area');
            var frag = $(document.createDocumentFragment());

            //一旦削除
            $('.timeline-scale' ).remove();
            $('#timeline-scale-term').remove();

            //スケールブロック
            var max = Math.ceil(w /1000); //領域が大きすぎるとFFでイメージが消えるため、1000px単位で分割する。
            var tmp = w;
            for(var i = 0 ;i < max; i++){
                $("<div class='timeline-scale' id='timeline-scale" + i + "' />")
                    .appendTo(frag)
                    .width(i == max -1 ? tmp : 1000)
                    .css('left', l + (i * 1000))
                    .height(opt.SCALE_IMAGE_HEIGHT);
                tmp -= 1000;
            }
            //終端部
            $('<div class="timeline-scale-term" id="timeline-scale-term"/>')
                .appendTo(frag)
                .css('left',w + l)
                .width(1)
                .height(opt.SCALE_IMAGE_HEIGHT);
            frag.appendTo(parent);
        },
		/*
		 * カラーバーのCanvas領域作成
		 */
        _createColorbar: function(){
            var self = this,
                opt = self.options;

            //親領域
            var parent = $('#timeline-body-mid');
            var frag = $(document.createDocumentFragment());

            //一旦削除
            $('.timeline-color-canvas').remove();

            //大きなCanvasは描画できないため、1時間単位で作成する
            var maxw = Math.ceil(opt.maxTime / opt.scale) * opt.PIXEL_PER_SCALE;
            var unitw = Math.ceil(3600 / opt.scale) * opt.PIXEL_PER_SCALE;
            var h = opt.BODY_MID_HEIGHT;
            var i = 0, w = 0, max = maxw;
            for(i = 0; max > 0; i++){
            	w = max >= unitw ? unitw : max;
                max -= w;
                $("<canvas class='timeline-color-canvas' id='timeline-canvas" + i + "' width='" + w + "' height='" + h + "'></canvas>")
                    .appendTo(frag);
            }
            frag.appendTo(parent);
            //Canvas描画
            self._drawColorbar();
        },
		/*
		 * カラーバーのCanvas描画
		 */
        _drawColorbar: function(){
            var self = this,
                opt = self.options;

            //大きなCanvasは描画できないため、1時間単位で作成する
            var maxw = Math.ceil(opt.maxTime / opt.scale) * opt.PIXEL_PER_SCALE;
            var unitw = Math.ceil(3600 / opt.scale) * opt.PIXEL_PER_SCALE;
            var h = opt.BODY_MID_HEIGHT;
            var max_blk = Math.ceil(maxw / unitw);

            //一旦Canvasをクリアする
            var max = maxw;
            for(var i = 0; max > 0; i++){
                var w = max >= unitw ? unitw : max;
                max -= w;
                var ctx = $('#timeline-canvas' + i)[0].getContext('2d');
                if(ctx){
                    ctx.clearRect(0,0,w,h);
                }
            }
            if(!self.colorBarTable){
                return;
            }

            //描画
            var len = self.colorBarTable.length;
            var l = 0, w = 0, block = 0;
            var ctx = $('#timeline-canvas' + block)[0].getContext('2d');
            for(var i = 0 ;i < len; i++){
                var item = self.colorBarTable[i];
                w = Math.floor((item.end - item.begin) / opt.scale) * opt.PIXEL_PER_SCALE;
                l = Math.floor(item.begin / opt.scale) * opt.PIXEL_PER_SCALE;
                var bno = Math.floor(l / unitw);
                if(bno != block){
                    //新しいブロック
                    block = bno;
                    ctx = $('#timeline-canvas' + block)[0].getContext('2d');
                }
                l -= block * unitw;//ブロック内位置
                if(l + w > unitw){
                    //ブロックまたがり
                    while(w > 0){
                        var w1 = l + w - unitw;
                        if(w1 < 0){
                            w1 = 0;
                        }
                        ctx.fillStyle = opt.COLOR_TABLE[item.colorno];
                        ctx.fillRect(l, 0, w - w1, h);
                        w -= w - w1;
                        l = 0;
                        if(++block >= max_blk){
                            break;
                        }
                        ctx = $('#timeline-canvas' + block)[0].getContext('2d');
                    }
                }
                else{
                    //同一ブロック
                    ctx.fillStyle = opt.COLOR_TABLE[item.colorno];
                    ctx.fillRect(l, 0, w, h);
                }
            }
        },
		/*
		 * 領域のHTML
		 */
        _timelineHtml: function() {
            return 	'<div class="timeline-area" id="timeline-area">' +
                '<div class="timeline-time-block" id="timeline-time-block"/>' +
                '<div class="timeline-body-block" id="timeline-body-block">' +
                '<div class="timeline-body-block-left" id="timeline-body-block-left"/>' +
                '<div class="timeline-body-block-mid" id="timeline-body-block-mid">' +
                '<div class="timeline-scale-area" id="timeline-scale-area"/>' +
                '<div class="timeline-body-top density-0" id="timeline-body-top"/>' +
                '<div class="timeline-body-mid density-0" id="timeline-body-mid"/>' +
                '<div class="timeline-body-bottom density-0" id="timeline-body-bottom"/>' +
                '</div>' +
                '<div class="timeline-body-block-right" id="timeline-body-block-right"/>' +
                '</div>' +
                '</div>';
        },
		/*
		 * タイムラインの再計算
		 */
        _recalcWidth: function() {
            var self = this,
                opt = self.options;
            var w = Math.ceil(opt.maxTime / opt.scale) * opt.PIXEL_PER_SCALE;
            //全体
            $('#timeline-area').width(w + opt.SCALE_PADDING*2);
            //時刻部
            $('#timeline-time-block').width(w + opt.SCALE_PADDING*2).height(opt.TIME_TEXT_HEIGHT);
            //時刻文字際作成
            self._createScaleTime();
            $('#timeline-body-block-left')
                .css('top',opt.TIME_TEXT_HEIGHT)
                .width(opt.SCALE_PADDING - Math.floor(opt.CURSOR_IMAGE_WIDTH/2))
                .height(opt.SCALE_IMAGE_HEIGHT + opt.BODY_TOP_HEIGHT + opt.BODY_MID_HEIGHT + opt.BODY_BOTTOM_HEIGHT);
            $('#timeline-body-block-mid')
                .css('left',opt.SCALE_PADDING)
                .css('top',opt.TIME_TEXT_HEIGHT)
                .width(w + opt.CURSOR_IMAGE_WIDTH);
            $('#timeline-body-block-right')
                .css('left',opt.SCALE_PADDING + w + opt.CURSOR_IMAGE_WIDTH)
                .css('top',opt.TIME_TEXT_HEIGHT)
                .width(opt.SCALE_PADDING - Math.floor(opt.CURSOR_IMAGE_WIDTH/2))
                .height(opt.SCALE_IMAGE_HEIGHT + opt.BODY_TOP_HEIGHT + opt.BODY_MID_HEIGHT + opt.BODY_BOTTOM_HEIGHT);
            //スケール表示部
            self._createScale();
            //ボディ部
            $('#timeline-body-top')
                .css('top',opt.SCALE_IMAGE_HEIGHT)
                .css('left', Math.floor(opt.CURSOR_IMAGE_WIDTH/2))
                .width(w)
                .height(opt.BODY_TOP_HEIGHT);
            $('#timeline-body-mid')
                .css('top',opt.SCALE_IMAGE_HEIGHT + opt.BODY_TOP_HEIGHT)
                .css('left', Math.floor(opt.CURSOR_IMAGE_WIDTH/2))
                .width(w)
                .height(opt.BODY_MID_HEIGHT);
            $('#timeline-body-bottom')
                .css('top',opt.SCALE_IMAGE_HEIGHT + opt.BODY_TOP_HEIGHT + opt.BODY_MID_HEIGHT)
                .css('left', Math.floor(opt.CURSOR_IMAGE_WIDTH/2))
                .width(w)
                .height(opt.BODY_BOTTOM_HEIGHT);
            //カラーバー領域作成
            self._createColorbar();
            //カーソル位置
            self._setPlayCursorPos();
        },
		/*
		 * カーソル位置
		 */
        _setPlayCursorPos: function() {
            var self = this,
                opt = self.options;
            var cur = $('#timeline-play-cursor');
            var pos = Math.round(opt.playPos / opt.scale) * opt.PIXEL_PER_SCALE;
            cur.css('left',pos);

            //スクロール
            self._visibleCursorPos(opt.playPos);
            var parent = $('#timelineArea');

            if (parent[0]) {            // TODO add null check
            //端まで言ったら余白分含めて最後までスクロールさせる
            if(opt.playPos >= opt.maxTime){
                parent.scrollLeft(parent.scrollLeft() + opt.SCALE_PADDING);
            }
            else if(opt.playPos <= 0){
                parent.scrollLeft(0);
            }
            }            // TODO add null check
        },
		/*
		 * カーソルを可視位置にスクロールする
		 */
        _visibleCursorPos: function(curPos){
            var self = this,
                opt = self.options;
            var pos = Math.ceil(curPos / opt.scale) * opt.PIXEL_PER_SCALE;//カーソル位置
            //スクロール
            var parent = $('#timelineArea');
            if (parent[0]) {            // TODO add null check
            var pl = parent.scrollLeft();//スクロール量
            var pw = parent.width();//表示範囲
            var pr = pl + pw;//タイムライン右端のX座標
            var curPt = pos + opt.SCALE_PADDING;//カーソルのX座標
            var maxpr = parent[0].scrollWidth - pw;//最大スクロール位置

            //右側に隠れている？
            if(curPt >= pr - (opt.CURSOR_IMAGE_WIDTH/2)){
                var scroll = ((curPt - pw) + (opt.PIXEL_PER_SCALE*2));
                if(scroll > maxpr){
                    scroll = maxpr;
                }
                parent.scrollLeft(scroll);
            }
            else if(curPt < pl){
                var scroll = curPt - opt.PIXEL_PER_SCALE;
                if(scroll < 0){
                    scroll = 0;
                }
                parent.scrollLeft(scroll);
            }
            }            // TODO add null check
        },

        //パブリックメソッド

		/*
		 * 次のカラーバー領域を検索
		 */
        searchNext: function(){
            var self = this,
                opt = self.options;
            for( var i = 0; i < self.colorBarTable.length; i++){
                if(self.colorBarTable[i].begin > opt.playPos){
                    var t = self.colorBarTable[i].begin;
                    self.setPlayPos(t);
                    //コールバック
                    if(opt.onTimeChanged){
                        if(t >= opt.maxTime){
                            t = opt.maxTime;
                        }
                        opt.onTimeChanged(t);
                    }
                    break;
                }
            }
        },
		/*
		 * 前のカラーバー領域を検索
		 */
        searchPrev: function(){
            var self = this,
                opt = self.options;
            for( var i = self.colorBarTable.length-1; i >= 0; i--){
                if(self.colorBarTable[i].end < opt.playPos){
                    var t = self.colorBarTable[i].begin;
                    self.setPlayPos(t);
                    //コールバック
                    if(opt.onTimeChanged){
                        if(t >= opt.maxTime){
                            t = opt.maxTime;
                        }
                        opt.onTimeChanged(t);
                    }
                    break;
                }
            }
        },

        //セッター

		/*
		 * タイムラインデータ・セット
		 */
        setMaxTime: function(maxTime) {
            var self = this,
                opt = self.options;
            opt.maxTime = maxTime;
            //スケール、再生位置初期化
            opt.scale = 1;
            opt.playPos =  0;
            //パネル再作成
            self._recalcWidth();
        },
		/*
		 * スケールセット
		 */
        setScale: function(scale) {
            var self = this,
                opt = self.options;
            if(scale > 0 && opt.scale != scale){
                opt.scale = scale;
                self._recalcWidth();
            }
        },
		/*
		 * 再生位置セット
		 */
        setPlayPos: function(pos) {
            var self = this,
                opt = self.options;
            if (self.dragStart)//ドラッグ中は無視
                return;
            if(pos >= 0 && pos <= opt.maxTime){
                if(opt.playPos != pos){
                    opt.playPos = pos;
                    self._setPlayCursorPos();
                }
            }
        },
		/*
		 * カラーバーテーブル作成
		 * @param: arr 検索結果データ　frame単位でbegin,endの値を持つ配列
		 */
        setColorbarData: function(arr, framerate){
            var self = this,
                opt = self.options;

            self.colorBarTable = []; //内部テーブルを一旦初期化
            var fscale = framerate * opt.scale;
            var s = 0, sr = 0, e = 0, er = 0, pe = 0, per = 0, c = 0;
            for(var i = 0; i < arr.length; i++){
                var item = arr[i];
                s = Math.ceil(item.begin / fscale) * fscale;	//先頭時間（スケール単位）
                if(s > item.end){
                    //スケール単位に満たない
                    if( per != 0 && pe < s){
                        //前回余りと今回余りは別区間なので、前回余りのみの区間追加
                        c = Math.ceil((per / fscale) / opt.COLOR_TABLE_SCALE);//カラーテーブルインデックス
                        self.colorBarTable.push({begin:Math.floor((pe - fscale) / fscale), end:Math.floor(pe / fscale), colorno:c});
                        per = 0;
                    }
                    //余りを加える
                    er = item.end - item.begin + per;				//終端の余り秒+前回余り
                    e = s;											//次の終端時間（スケール単位）
                }
                else{
                    //区間またがり
                    sr = s - item.begin;							//先頭の余り秒
                    e = Math.floor(item.end / fscale) * fscale;		//終端時間（スケール単位）
                    if( e < item.end){
                        er = item.end - e;							//終端の余り秒
                    }
                    else{
                        er = 0;
                    }
                    //前回余りがあれば今回余りと合わせて区間作成
                    if(per != 0){
                        if(pe == s){
                            //前回余りと今回先端余りを同一区間として追加
                            c = Math.ceil(((sr + per) / fscale) / opt.COLOR_TABLE_SCALE);//カラーテーブルインデックス
                            self.colorBarTable.push({begin:Math.floor((pe - fscale) / fscale), end:Math.floor(s / fscale), colorno:c});
                            sr = 0;
                        }
                        else{
                            //前回余りと今回先端余りは別区間なので、前回余りのみの区間追加
                            c = Math.ceil((per / fscale) / opt.COLOR_TABLE_SCALE);//カラーテーブルインデックス
                            self.colorBarTable.push({begin:Math.floor((pe - fscale) / fscale), end:Math.floor(pe / fscale), colorno:c});
                        }
                    }
                    if(sr != 0){
                        //先端余りのみ区間を追加
                        c = Math.ceil((sr / fscale) / opt.COLOR_TABLE_SCALE);//カラーテーブルインデックス
                        self.colorBarTable.push({begin:Math.floor((s - fscale) / fscale), end:Math.floor(s / fscale), colorno:c});
                    }
                    if(s < e){
                        //余りを除いた区間を追加
                        c = Math.ceil(1.0 / opt.COLOR_TABLE_SCALE);//カラーテーブルインデックス
                        self.colorBarTable.push({begin:Math.floor(s / fscale), end:Math.floor(e / fscale), colorno:c});
                    }
                    e = e + fscale;		//次の終端時間（スケール単位）
                }
                pe = e;
                per = er;
            }// end of for loop

            //最後の終端余り
            if(per != 0){
                c = Math.ceil((per / fscale) / opt.COLOR_TABLE_SCALE);//カラーテーブルインデックス
                self.colorBarTable.push({begin:Math.floor((pe - fscale) / fscale), end:Math.floor(pe / fscale), colorno:c});
            }
            //Canvas描画
            self._drawColorbar();
        },

        //ゲッター

		/*
		 * スケール取得
		 */
        getScale: function() {
            return this.options.scale;
        },
		/*
		 * 音声再生位置取得
		 */
        getPlayPos: function() {
            return this.options.playPos;
        },
        widget: function() {
            return this.timeline;
        }
    });

	/*
	 * プラグインの静的プロパティ定義
	 */
    $.extend($.vw.timeline, {
        version: '1.0.0',
        getter: 'getScale, getPlayPos',
        setter: 'setMaxTime, setScale, setPlayPos, setColorbarData'
    });
})(jQuery);