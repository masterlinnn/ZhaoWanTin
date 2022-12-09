$(document).ready(function()
{
	var video=$('#myVideo');
	//关闭播放器默认风格
	video[0].removeAttribute("controls");
	$('.control').show().css({'bottom':-45});
	$('.loading').fadeIn(500);
	$('.caption').fadeIn(500);
	//监听onloadedmetadata事件
	video.on('loadedmetadata',function(){
		$('.caption').animate({'top':-45},300);
		//初始化播放时间显示
		$('.current').text(timeFormat(0));
		$('.duration').text(timeFormat(video[0].duration));
		//在视频显示区域添加播放按钮.
		$('.videoContainer').append('<div id="init"></div>').hover(function(){
			$('.control').stop().animate({'bottom':0},500);
			$('.caption').stop().animate({'top':0},500);
		});
		$('#init').fadeIn(200);
	});
	//监听oncanplay事件
	video.on('canplay',function(){
		$("#init").fadeOut(200);
		$('.loading').fadeOut(100);
	});
	//监听oncanplaytrough事件
	var completeloaded=false;
	video.on('canplaytrough',function(){
		completeloaded=true;
	});
	//监听onended事件
	video.on('ended',function(){
		$('.btnPlay').removeClass('paused');
		video[0].pause();
	});
	//监听onwaiting事件
	video.on('waiting',function(){
		$('.loading').fadeIn(200);
	});
	//将时间格式化为00:00
	var timeFormat=function(seconds){
		var m=Math.floor(seconds/60)<10?"0"+Math.floor(seconds/60) : Math.floor(seconds/60);
		var s=Math.floor(seconds-(m*60))<10?"0"+Math.floor(seconds-(m*60)): Math.floor(seconds-(m*60));
		return m+":"+s;
	};
	//监听暂停播放事件
	video.on('click',function(){
		playpause();
	});
	$('.btnPlay').on('click',function(){
		playpause();
	});
	var playpause=function(){
		if (video[0].paused || video[0].ended) {
			$('.btnPlay').addClass('paused');
			video[0].play();
		}
		else{
			$('.btnPlay').removeClass('paused');
			video[0].pause();
		}
	};
	//监听ontimeupdate事件动态显示播放时间和进度控制条
	video.on('timeupdate',function(){
		var currentPos=video[0].currentTime;
		var maxduration=video[0].duration;
		var perc=100*currentPos/maxduration;
		$('.timeBar').css('width',perc+'%');
		$('.current').text(timeFormat(currentPos));
	});
	//显示缓冲进度
	var startBuffer=function(){
		var currentBuffer=video[0].buffered.end(0);
		var maxduration=video[0].duration;
		var perc=100*currentBuffer/maxduration;
		$('.bufferBar').css('width',perc+'%');
		if (currentBuffer<maxduration) {
			setTimeout(startBuffer,500);
		}
	};
	//显示播放进度，并监听onmusedown和onmuseup事件
	var timeDrag=false;
	$('.progress').on('mousedown',function(e){
		timeDrag=true;
		updatebar(e.pageX);
	});
	$(document).on('mouseup',function(e){
		if (timeDrag) {
			timeDrag=false;
			updatebar(e.pageX);
		}
	});
	$(document).on('mousemove',function(e){
		if (timeDrag) {
			updatebar(e.pageX);
		}
	});
	var updatebar=function(x){
		var progress=$('.progress');
		var maxduration=video[0].duration;
		var position=x - progress.offset().left;
		var percentage=100*position/progress.width();
		if (percentage>100) {
			percentage=100;
		}
		if (percentage<0) {
			percentage=0;
		}
		$('.timeBar').css('width',percentage+'%');
		video[0].currentTime=maxduration*percentage/100;
	};
	//静音按钮
	$('.sound').click(function(){
		video[0].muted=!video[0].muted;
		$(this).toggleClass('muted');
		if (video[0].muted) {
			$('.volumeBar').css('width',0);
		}
		else{
			$('.volumeBar').css('width',video[0].volume*100+'%');
		}
	});
	//音量调节滑动条
	var volumeBar=false;
	$('.volume').on('mousedown',function(e){
		volumeDrag=true;
		video[0].muted=false;
		$('.sound').removeClass('muted');
		updateVolume(e.pageX);
	});
	$(document).on('mouseup',function(e){
		if (volumeDrag) {
			volumeDrag=false;
			updateVolume(e.pageX);
		}
	});
	$(document).on('mousemove',function(e){
		if (volumeDrag) {
			updateVolume(e.pageX);
		}
	});
	var updateVolume=function(x,vol){
		var volume=$('.volume');
		var percentage;
		if (vol) {
			percentage=vol*100;
		}
		else{
			var position=x-volume.offset().left;
			percentage=100*position/volume.width();
		}
		if (percentage>100) {
			percentage=100;
		}
		if (percentage<0) {
			percentage=0;
		}
		$('.volumeBar').css('width',percentage+'%');
		video[0].volume=percentage/100;
		if (video[0].volume==0) {
			$('.sound').removeClass('sound2').addClass('muted');
		}
		else if (video[0].volume>0.5) {
			$('.sound').removeClass('muted').addClass('sound2');
		}
		else{
			$('.sound').removeClass('muted').removeClass('sound2');
		}
	};
	//播放速率选择按钮
	$('.btnx1').on('click',function(){
		fastfoward(this,1);
	});
	$('.btnx3').on('click',function(){
		fastfoward(this,3);
	});
	var fastfoward=function(obj,spd){
		$('.text').removeClass('selected');
		$(obj).addClass('selected');
		video[0].playbackRate=spd;
		video[0].play();
	};
	//停止按钮
	$('.btnStop').on('click',function(){
		$('.btnPlay').removeClass('paused');
		updatebar($('.progress').offset().left);
		video[0].pause();
	});
	//全屏按钮
	$('.btnFS').on('click',function(){
		if ($.isFunction(video[0].webkitEnterFullscreen)) {
			video[0].webkitEnterFullscreen();
		}
		/*else if ($.isFunction(video[0].mozRequestFullscreen) {
			video[0].mozRequestFullscreen();
		}*/
		else{
			alert('sorry,你的浏览器还不支持全屏播放');
		}
	});
	//关灯按钮
	$('.btnLight').click(function(){
		$(this).toggleClass('lighton');
		if (!$(this).hasClass('lighton')) {
			$('body').append('<div class="overlay"></div>');
			$('.overlay').css({
				'position':'absolute',
				'width':100+'%',
				'height':$(document).height(),
				'background':'#000',
				'opacity':0.9,
				'top':0,
				'left':0,
				'z-index':999
			});
			$('.videoContainer').css({
				'z-index':1000
			});
		}
		else{
			$('.overlay').remove();
		}
	});
});
