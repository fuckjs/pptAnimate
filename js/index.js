define(function(require,exports,module){
	require("FullPageScroll.js");
	
	exports.start = function(){
		//全屏滚动插件参数设置
		$("#container").pageSwitch({
			direction : "herizental",
			index :0,
			loop : true,
			callback: startMove1,
			autoPlay: false,
			duration : 1000,
			callback : startMove1,
			transitionBefore :	removeMove1
		});
		$("#container").pageSwitch("init");
		$("#container").pageSwitch("autoPlay");
		
		//阻止冒泡
		$(".section").on("transitionend",function(e){
			e.stopPropagation();
		})
		
		//时钟
		clock();
		
		//页面动画执行
		startMove1();
	}
	
	//第一个页面添加效果
	function startMove1(){
		$("div.shopNum p").addClass("active");
		$("div.shopNum span").addClass("active");
		$("p.keyDesc").addClass("active");
	}
	//第一个页面去除效果 
	function removeMove1(){
		$("div.shopNum p").removeClass("active");
		$("div.shopNum span").removeClass("active");
		$("p.keyDesc").removeClass("active");
	}
	function clock(){
		var oDate = new Date();
		
		var str =oDate.getFullYear()+"年"+(oDate.getMonth()+1)+"月"+oDate.getDate()+
		"日";
		/*+oDate.getHours()+"时"+oDate.getMinutes()+"分"+oDate.getSeconds()+"秒"*/
		$(".nowTime").html(str);
	}
})
