/*
 * Copyright (C) 2017 TOSHIBA CORPORATION, All Rights Reserved.
 *
 */

(function($){
	/*
	* widget定義
	*/
	$.widget('vw.videoplayer', {
		/*
		* デフォルトオプション
		*/
		options: {
            src:'',                 //動画ソースURL
            videoWidth:0,
            videoHeight:0,
            duration:0,
			onPlay:null,			//再生時のコールバック
			onPause:null,			//停止時のコールバック
            onVolumeChange:null,	//ボリューム変更時のコールバック
            onLoadMeta:null,       //メタ情報ロード時のコールバック
            onCanplayThrough:null,	//最後まで再生準備完了時のコールバック
			onStalled:null,			//予期しないエラー時のコールバック
			onError:null			//エラー時のコールバック
		},
		/*
		* 初期化
		*/
		_init: function() {
			var self = this,
				opt = self.options;
			//Video作成
			self.element.prepend(self._videoHtml());
            var video = this.video = $('#videoPlayer')[0];
            //再生イベント
            $(video).on('play', function(event){
				//コールバック
				if(opt.onPlay){
                    opt.onPlay();
                }
            })
            //停止イベント
			.on('pause', function(event){
				//コールバック
				if(opt.onPause){
					opt.onPause();
				}
			})
			//ボリューム変更イベント
			.on('volumechange', function(event){
				//コールバック
				if(opt.onVolumeChange){
					opt.onVolumeChange();
				}
			})
            //終端イベント
			.on('ended', function(event){
				if (self.video){
					//ループ再生でなければ
					if(!self.video.loop){
						//IEは終端でPauseイベントが来ないので、自前で止める
						self.video.pause();
					}
				}
			})
            //メタデータロードイベント
            .on('loadedmetadata', function(event){
                opt.duration = video.duration;
                opt.videoWidth = video.videoWidth;
                opt.videoHeight = video.videoHeight;
				//コールバック
				if(opt.onLoadMeta){
                    opt.onLoadMeta();
                }
            })
            //エラー
            .on('error', function(event){
                //コールバック
                if(opt.onError){
                    opt.onError();
                }
            })
            //最後まで再生準備完了
            .on('canplaythrough', function(event){
                //コールバック
                if(opt.onCanplayThrough){
                    opt.onCanplayThrough();
                }
            })
            //予期しないエラー
            .on('stalled', function(event){
                //コールバック
                if(opt.onStalled){
                    opt.onStalled();
                }
            });
            video.src = opt.src;
		},
		/*
		* 領域のHTML
		*/
		_videoHtml: function() {
			return 	'<video id="videoPlayer"></video>';
		},
		/*
		* 再生
		*/
		play: function() {
			var self = this,
				opt = self.options;
			if (self.video){
                self.video.play();
            }
		},
		/*
		* 停止
		*/
		pause: function() {
			var self = this,
				opt = self.options;
			if (self.video){
                self.video.pause();
            }
		},
		/*
		* 再生領域のフィッティング
		*/
        resiseToFit: function(){
			var self = this,
				opt = self.options;
            var video = $(self.video);
            var parent = $(self.element);
            //表示領域
            var pw = parent.width();
            var ph = parent.height();
            //表示領域と動画サイズから拡大率を計算
            var ratio = opt.videoWidth / opt.videoHeight;
            var pratio = pw / ph;
            var scale=0.0;
            if (ratio <= pratio) {
                scale = ph / opt.videoHeight;
            }
            else {
                scale = pw / opt.videoWidth;
            }
            video.width(scale * opt.videoWidth);
            video.height(scale * opt.videoHeight);
            //領域に合わせて中央寄せ
            var vw = video.width();
            var vh = video.height();
            if(pw > vw){
                video.scrollLeft(parent.scrollLeft() + (pw - vw) / 2);
            }
            else{
                video.scrollLeft(parent.scrollLeft());
            }
            if(ph > vh){
                video.scrollTop(parent.scrollTop()+ (ph - vh) / 2);
            }
            else{
                video.scrollTop(parent.scrollTop());
            }
        },

	    //セッター

		/*
		* 再生位置セット
		*/
		setPlayPos: function(pos) {
			var self = this,
				opt = self.options;
			if (self.video){
				if(pos > Math.floor(self.video.duration-1)){
					pos = Math.floor(self.video.duration-1);
				}
				else if( pos < 0){
					pos = 0;
				}
                self.video.currentTime = pos;
            }
            return pos;
		},
		/*
		* 再生ソースセット
		*/
		setSrc: function(url) {
			var self = this,
				opt = self.options;
			if (self.video){
                self.video.src = url;
            }
		},
		/*
		* ボリュームセット
		*/
		setVolume: function(vol) {
			var self = this,
				opt = self.options;
			if (self.video){
                self.video.volume = vol;
            }
		},
		/*
		* ミュート状態セット(true or false)
		*/
		setMuted: function(flg) {
			var self = this,
				opt = self.options;
			if (self.video){
                self.video.muted = flg;
            }
		},

	    //ゲッター

		/*
		* 再生位置取得
		*/
		getPlayPos: function() {
			var self = this,
				opt = self.options;
            var pos = 0;
			if (self.video){
                pos = self.video.currentTime;
            }
            return pos;
		},
		/*
		* 再生ソース取得
		*/
		getSrc: function(url) {
			var self = this,
				opt = self.options;
            var src = '';
			if (self.video){
                src = self.video.src;
            }
            return src;
		},
		/*
		* 再生時間取得
		*/
		getDuration: function() {
			var self = this,
				opt = self.options;
            var duration = 0;
			if (self.video){
                duration = self.video.duration;
            }
            return duration;
		},
		/*
		* ボリューム取得
		*/
		getVolume: function() {
			var self = this,
				opt = self.options;
            var vol = 0;
			if (self.video){
                vol = self.video.volume;
            }
            return vol;
		},
		/*
		* ミュート状態取得
		*/
		getMuted: function() {
			var self = this,
				opt = self.options;
            var muted = false;
			if (self.video){
                muted = self.video.muted;
            }
            return muted;
		},

		widget: function() {
			return this.video;
		}
	});

	/*
	* プラグインの静的プロパティ定義
	*/
	$.extend($.vw.videoplayer, {
		version: '1.0.0',
		getter: 'getPlayPos, getMuted, getVolume',
        setter: 'setPlayPos, setMuted, setVolume'
	});
})(jQuery);