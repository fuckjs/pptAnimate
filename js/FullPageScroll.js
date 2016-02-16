(function($){
	//私有方法
	var _prefix = (function (temp) {
        var prefix = ["webkit", "Moz", "o", "ms"];
        var props = "";
        for (var i = 0; i < prefix.length; i++) {
            props = prefix[i] + "Transition";
            if (temp.style[props] !== undefined) {
                return "-" + prefix[i].toLowerCase() + "-";
            }
        }
        return false;
        //猜测这里是随意创造一个节点，然后尝试判断该节点是否可以拥有该属性
    })(document.createElement(PageSwitch));
    
    
	var PageSwitch = (function(){
		function PageSwitch(element,options){
			this.settings = $.extend(true,$.fn.pageSwitch.default,options||{});//将后两项进行合并
			this.element = element;
			//this.init();		//在下面new的时候  自动执行init方法
		}
		PageSwitch.prototype = {
			init : function(){		//初始化Dom结构  绑定事件
				var me = this;
				//根据传进来的参数 初始化设置
				me.selectors = me.settings.selectors;		//选择器
				me.sections = $(me.selectors.sections);	//包含着几个界面的div
				me.section = me.sections.find(me.selectors.section);//每一个界面

				me.direction = me.settings.direction=="vertical"?true:false;		//页面切换方向
				me.pagesCount = me.pageCount();		//页数
				
				me.index = (me.settings.index>=0&&me.settings.index<me.pagesCount)?me.settings.index:0;
				
				if(!me.direction){		//如果方向为横向，改变样式
					me._initLayout();
				};
				if(me.settings.pagination){		//如果设置分页 执行分页的Dom样式渲染
					me._initPaging();
				}
				me._initEvent();
			},
			pageCount:function(){
				var me = this;
				return me.section.length;
			},
			switchLength : function(){	//获取滑动的距离
				return this.direction?this.element.height():this.element.width();
			},
			autoPlay:function(){
				var me=this;
				setInterval(function(){
					me.next();
				},6000)
			},
			prev : function(){
				var me = this;
				if(me.index>0)
				{
					me.index--;
				}else if(me.settings.loop){
					me.index = me.pagesCount-1;
				}
				me._scrollPage();
			},
			next : function(){
				var me = this;
				if(me.index<me.pagesCount-1){
					me.index++;
				}else if(me.settings.loop){
					me.index = 0;
				};
				//alert(me.index);
				me._scrollPage()
			},
			_initLayout : function(){		//针对横屏情况进行重新布局
				var me = this;
				var width = me.pagesCount*100+"%";
				var cellWidth = (100/me.pagesCount).toFixed(2)+"%";
				
				me.sections.width(width);
				me.section.width(cellWidth).css("float","left");
			},
			_initPaging : function(){		//实现分页的Dom结构及css样式
				var me = this;
				var pagesClass = me.selectors.page.substring(1);
				me.activeClass = me.selectors.active.substring(1);
				
				var pageHtml = "<ul class="+pagesClass+">";
				for(var i=0;i<me.pagesCount;i++)
				{
					pageHtml+= "<li></li>"
				};
				pageHtml+="</ul>";
				me.element.append(pageHtml);
				var pages = me.element.find(me.selectors.page);	//分页标志的ul;
				me.pageItem = pages.find("li");
				me.pageItem.eq(me.index).addClass(me.activeClass)
			},
			_initEvent : function(){		//初始化插件事件
				//分页事件
				var me = this;
				me.element.on("click",me.selectors.page+" li",function(){
					me.index = $(this).index();
					me._scrollPage();
				});
				me.element.on("mousewheel DOMMouseScroll",function(e){
					var delta = e.originalEvent.wheelDelta||-e.originalEvent.detail;
					if(delta>0&&(me.index&&!me.settings.loop ||me.settings.loop))
					{
						me.prev();
					}else if(delta<0&&(me.index<(me.pagesCount-1)&& !me.settings.loop ||me.settings.loop))
					{
						me.next();
					};
					if(me.settings.keyboard){
						$(window).on("keydown",function(e){
							var keyCode = e.keyCode;
							if(keyCode ==37 ||keyCode ==38){		//左键和上键
								me.prev();
							}else if(keyCode ==39||keyCode == 40){
								me.next();
							}
						})
					}
				});
//				$(window).resize(function(){
//					var currentLength = me.switchLength();
//					offset = me.settings.direction?me.section.eq(me.index).offset().top:me.section.eq(me.index).offset().left;
//					if(Math.abs(offset) > currentLength/2 && me.index<(me.pagesCount-1)){
//						me.index++;
//					}
//					if(me.index){
//						me._scrollPage();
//					}
//				});
// webkitTransitionEnd oTransitionEnd otransitionEnd
				//alert($("div.sections").length);
				me.sections.on("transitionend",function(){
					if(me.settings.callback&&$.type(me.settings.callback)==="function"){
						me.settings.callback();
					}
				})
			},
			//其实本质就是activeIndex被更改了，然后在这里修改相印的样式
            _scrollPage : function () {
            	
                var me = this;
                if(me.settings.transitionBefore&&$.type(me.settings.transitionBefore)==="function"){
						me.settings.transitionBefore();
				}
                /*alert(me.index);
                alert(me.pagesCount);*/
                var activeFace = me.section.eq(me.index).position();
                //alert(me.index);
                //alert(activeFace.top);
                if (!activeFace)return;
                me.canScroll = false;
                //拥有该样式
                if (_prefix) {
                    me.sections.css(_prefix + "transition", "all " + me.settings.duration + "ms " + me.settings.easing);
                    //console.log(activeFace);
                    var translate = me.direction ? "translateY(-" + activeFace.top + "px)" : "translateX(-" + activeFace.left + "px)";
                    me.sections.css(_prefix + "transform", translate);
                } else {
                    var animateCss = me.direction ? {top : -activeFace.top} : {left : -activeFace.left};
                    me.sections.animate(animateCss, me.settings.duration, function () {
                        me.canScroll = true;
                        if (me.settings.onPageSwitch && $.type(me.settings.onPageSwitch) == "function") {
                            me.settings.onPageSwitch();
                        }
                    })
                }
                if (me.settings.pagination) {
                    me.pageItem.eq(me.index).addClass(me.activeClass).siblings("li").removeClass(me.activeClass);
                }
            }
        };
		return PageSwitch;		//因为是自执行  所以要return
	})();

	$.fn.pageSwitch = function(options){
		return this.each(function(){
			//要把实例化的new PageSwitch(me,options)挂在return出去的对象上
			var me =$(this);				//因为这个时候是在this.each里面  所以用$(this)获取对应的jQuery对象
			instance = me.data("PageSwitch");
			if(!instance)
			{
				instance = new PageSwitch(me,options);
				me.data("PageSwitch",instance);
			};
			if($.type(options)==="string")
			{
				return instance[options]();
			}//这样，当传递json时，为传递的参数；当传递字符串时，为调用方法。如$("div").PageSwitch("init");
		})
	};
	$.fn.pageSwitch.default = {
		selectors : {
			sections: ".sections",
			section : ".section",
			page : ".pages",
			active : ".active"
		},
		autoPlay : false,
		index : 0,
		easing : "ease",
		duration : 500,
		loop : true,
		pagination : false,		//是否进行分页
		keyboard : true,			//是否支持键盘事件
		direction : "vertical",
		callback : "",
		transitionBefore : ""
	};
})(jQuery)
