;(function(undefined) {
	if(String.prototype.trim === undefined)
		String.prototype.trim = function() { return this.replace(/^\s+|\s+$/g, ''); }

	// For iOS 3.x
	// from https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/reduce
	if (Array.prototype.reduce === undefined)
	Array.prototype.reduce = function(fun){
	  if(this === void 0 || this === null) throw new TypeError();
	  var t = Object(this), len = t.length >>> 0, k = 0, accumulator;
	  if(typeof fun != 'function') throw new TypeError();
	  if(len == 0 && arguments.length == 1) throw new TypeError();

	  if(arguments.length >= 2)
	   accumulator = arguments[1];
	  else
	    do{
	      if(k in t){
	        accumulator = t[k++];
	        break;
	      }
	      if(++k >= len) throw new TypeError();
	    } while (true)

	  while (k < len){
	    if(k in t) accumulator = fun.call(undefined, accumulator, t[k], k, t);
	    k++;
	  }
	  return accumulator;
	}
})();

var Best = (function() {
	var undefined, $, document= window.document,emptyArray = Array.prototype, slice = emptyArray.slice, filter = emptyArray.filter,
	best = {},
	getComputedStyle = document.defaultView.getComputedStyle,
	idRE = /^#([\w-]*)$/,
	classRE = /^\.([\w-]+)$/,
	tagRE = /^[\w-]+$/,
	readyRE = /complete|loaded|interactive/,
	rootNodeRE = /^(?:html|body)/i,
	class2type = {},
    toString = class2type.toString,
    uniq,
    tempParent = document.createElement('div')

    ;function type(obj) {
    	return obj == null ? String(obj) : class2type[toString.call(obj)] || 'object';
    }
	function isFunction(obj) { return type(obj) === 'function'; }
	function isWindow(obj) { return obj !== null && obj === obj.window }
	function isDocument(obj) {return obj !== null && !!obj.nodeType && obj.nodeType === obj.DOCUMENT_NODE; }
	function isObject(obj) { return type(obj) == 'object'; }
	function isPlainObject(obj) { return isObject(obj) && !isWindow(obj) && obj.__proto__ == Object.prototype; }
	function isArray(value) { return value instanceof Array; }
	function likeArray(obj) { return typeof obj.length == 'number'; }
	function filtered(nodes, selector) {
		return selector === undefined ? $(nodes) : $(nodes).filter(selector);
	}
	function flatten(array) { return array.length > 0 ? $.fn.concat.apply([], array) : array; }
	function uniq(array) { return filter.call(array, function(item, idx) { return array.indexOf(item) == idx; })}

	function setAttribute(node, name, value) {
		value == null ? node.removeAttribute(name) : node.setAttribute(name, value);
	}

	best.matches = function(element, selector) {
		if(!element && element.nodeType !== 1) return false;
		var matchesSelector = element.webkitMatchesSelector || element.mozMatchesSelector
			|| element.oMatchesSelector || element.matchesSelector;
		if(matchesSelector) return matchesSelector.call(element, selector);
		// fall back to performing a selector
		var match, parent = element.parentNode, temp = !parent;
		if(temp) (parent = tempParent).appendChild(element);
		match = ~best.query(parent, selector).indexOf(element);
		temp && tempParent.removeChild(element);
		return match;
	};
	// '$.best.dom' is the base for '$',return dom 
	best.dom = function(dom, selector) {
		dom = dom || [];
		dom.__proto__ = $.fn;
		dom.selector = selector || '';
		return dom;
	};

	best.isD = function(object) { return object instanceof best.dom; };

	//'$.best.init' will route the arguments based on the arguments
	best.init = function(selector, context) {
		var dom = [];
		if(!selector){ return best.dom(); }
		else if(typeof selector === 'string') {
			context = context !== undefined ? context : document;
			dom = best.query(context, selector);
		}
		else if(isDocument(selector)) { dom = [selector], selector = null; }
		else if(best.isD(selector)) { return selector; }
		else if (typeof selector == 'object') { dom = selector.length ? slice.call(selector) : [selector]; }
		else if(isFunction(selector)) { return $(document).ready(selector); }
		return best.dom(dom, selector);
	};

	$ = function(selector, context) {
		return best.init(selector, context);
	};

	function extend(target, source,deep) {
		for (key in source) {
			if (deep && (isPlainObject(source[key]) || isArray(source[key]))) {
				if (isPlainObject(source[key]) && !isPlainObject(target[key])) {
					target[key] = {};
				};
				if (isArray(source[key]) && !isArray(target[key])) {
					target[key] = [];
				};
				extend(target[key], source[key], deep);
			} else if (source[key] !== undefined) {
				target[key] = source[key];
			};
		}
	}

	$.extend = function(target) {
		var deep, args = slice.call(arguments, 1);
		if (typeof target == 'boolean') {
			deep = target;
			target = args.shift();
		}
		args.forEach(function(arg) {
			extend(target, arg, deep);
		});
		return target;
	};

	best.query = function(element, selector) {
		var temp = [];
		if(idRE.test(selector)) { temp[0] = element.getElementById(RegExp.$1); }
		else {
			temp = tagRE.test(selector) ? element.getElementsByTagName(selector) : element.querySelectorAll(selector);
		}
		return slice.call(temp);
	};

	$.inArray = function(elem, arr, i) {
		return emptyArray.indexOf.call(arr, elm, i);
	};

	$.contains = function(parent, node) {
		return parent !== node && parent.contains(node);
	};

	$.sibling = function(el, dir) {
		do {
			el = dir ? el.previousSibling : el.nextSibling;
		} while(el && el.nodeType != 1);
		return $(el);
	};

	// @param des 源DOM对象
	// @param src 要被插入的DOM对象
	$.insertBefore = function(des, src) {
		src = typeof src === 'string' ? doc.createElement(src) : src;
		des = typeof des === 'string' ? doc.getElementById(des) : des;
		var parent = des.parentNode || doc.body;
		for(var i = 0; i < parent.childNodes.length - 1; i++) {
			if(parent.childNodes[i] == des) {
				parent.insertBefore(src, parent.childNodes[i]);
				return src;
			}
		}
	};

	// @param target 目标DOM
	// @param newEl 要被插入的新对象
	$.insertAfter = function(target, newEl) {
		target = typeof target === 'string' ? doc.getElementById(target) : target;
		newEl = typeof newEl === 'string' ? doc.createElement(newEl) : newEl;
		var parent = target.parentNode || doc.body;
		if(parent.lastChild === target) {
			parent.appendChild(newEl);
		} else {
			parent.insertBefore(newEl, this.sibling(target));
		}
		return newEl;
	};

	$.map = function(elements, callback) {
		var value, values = [], i, key;
		if(likeArray(elements)) {
			for(var i = 0; i < elements.length; i++) {
				value = callback(elements[i], i);
				if(value != null) values.push(value);
			}
		} else {
			for(key in elements) {
				value = callback(elements[key], key);
				if(value != null) values.push(value);
			}
		}
		return flatten(values);
	};

	$.each = function(elements, callback) {
		var i, key;
		if(likeArray(elements)) {
			for(i = 0; i < elements.length; i++) 
				if(callback.call(elements[i], i, elements[i]) === false) return elements;
		}else {
			for(key in elements) 
				if(callback.call(elements[key], key, elements[key]) === false) return elements;
		}

		return elements;
	};



	// Populate the class2type map
	$.each("Boolean Number String Function Array Date RegExp Object Error".split(' '), function(i, name) {
		class2type['[object ' + name + "]"] = name.toLowerCase();
	});

	$.fn  = {

		forEach: emptyArray.forEach,
	    reduce: emptyArray.reduce,
	    push: emptyArray.push,
	    sort: emptyArray.sort,
	    indexOf: emptyArray.indexOf,
	    concat: emptyArray.concat,

	    map: function(fn) {
	    	return $($.map(this, function(el, i) { return fn.call(el, i, el) }));
	    },
		size: function() {
			return this.length;
		},
		_arr2obj: function(arr) {

		},	
		slice: function() {
			return $(slice.apply(this, arguments));
		},
		eq : function(idx) {
			return idx === -1 ? this.slice(idx) : this.slice(idx, + idx + 1);
		},
		first: function() {
			var el = this[0];
			return el && !isObject(el) ? el : $(el);
		},
		last: function() {
			var el = this[this.length - 1];
			return el && !isObject(el) ? el : $(el);
		},
		prev: function() {
			return $.sibling(this[0], true);
		},
		next: function() {
			return $.sibling(this[0]);
		},
		find: function(selector) {
			var result, _this = this;
			if(typeof selector == 'object') {
				result = $.contains(this[0], selector) ? $(selector, this[0]) : [];
			} else if(this.length === 1) {
				result = $(best.query(this[0], selector));
			} else {
				result = this.map(function() { return best.query(this, selector); });
			}
			return result;
		},
		ready: function(callback) {
			if(readyRE.test(document.readyState)) callback($);
			else document.addEventListener('DOMContentLoaded', function() {callback($)}, false) ;
			return this;
		},
		each: function(callback) {
			emptyArray.every.call(this, function(el, idx) {
				return callback.call(el, idx, el) !== false;
			});
			return this;
		},
		filter: function(selector) {
			if(isFunction(selector)) return this.not(this.not(selector));
			return $(filter.call(this, function(element){
				return best.matches(element, selector);
			}));
		},
		not: function(selector) {
			var nodes = [];
			if(isFunction(selector) && selector.call !== undefined) {
				this.each(function(idx) {
					if(!selector.call(this,idx)) nodes.push(this);
				});
			} else {
				var excludes = typeof selector == 'string' ? this.filter(selector) :
				(likeArray(selector) && isFunction(selector.item)) ? slice.call(selector) : $(selector);
				this.forEach(function(el) {
					if(excludes.indexOf(el) < 0) { nodes.push(el) }
				});
			}
			return $(nodes);
		},
		attr: function(name, value) {
			if(!!value) {
				if(!!this[0].className && name == 'class') {
					value = this[0].className + ' ' + value;
				}
				setAttribute(this[0], name, value);
				return this;
			} else {
				return this[0].getAttribute(name);
			}
		},
		removeAttr: function(name) {
			return this.each(function() { this.nodeType === 1 && setAttribute(this, name); });
		},
		css: function(property, value) {
			if(arguments.length < 2 && typeof property == 'string'){
				return this[0] && (this[0].style[property] || getComputedStyle(this[0], '').getPropertyValue(property));
			} else if(!!value) {
				this[0].style[property] = value;
			} else if(typeof property) {
				for(key in property) {
					this[0].style[key] = property[key];
				}
			}
			return this;
		},
	};

	best.dom.prototype = $.fn;
	$.best = best;
	return $;
})();

window.Best = Best;
'$' in window || (window.$ = Best);

;(function($) {
	
	// useCapture  捕获
	$.addEvent = function(el, type, fn, useCapture) {
		if(el.addEventListener) {
			el.addEventListener(type, fn, useCapture);   // DOM2.0
			return true;
		} else if(el.attachEvent) {
			var r = el.attachEvent('on' + type, fn);     // IE5+
			return r;
		} else {
			el['on' + type] = fn;  // DOM 0
		}
	};

	$.fn.touchEventBind = function(touch_options) {
		var touchSetting = $.extend({
			tapDurationThreshold: 250,  // 触屏大于这个时间不当作tap
			scrollSupressionThreshold: 10,  // 触发touchmove的敏感度
			swipeDurationThreshold: 750,  // 大于这个时间不当作swipe，1000
			horizontalDistanceThreshold: 30, // swipe的触发垂直方向move必须小于这个距离
			verticalDistanceThreshold: 75, // swipe的触发水平方向move必须小于这个距离
			tapHoldDurationThreshold: 750, // taphold的触发必须大于这个时间
			doubleTapInterval: 250 // 双击的时间间隔必须小于250
		}, touch_options ||　{});

		var touch = {}, touchIimeout, delta, longTapTimeout;

		function parentIfText(node) {
			return 'tagName' in node ? node : node.parentNode;
		}

		function swipeDirection(x1, x2, y1, y2) {
			var xDelta = Math.abs(x1 - x2), yDelta = Math.abs(y1 - y2);
			return xDelta >= yDelta ? (x1 - x2 > 0 ? 'Left' : 'Right') : (y1 - y2 > 0 ? 'Up' : 'Down');
		}

		function longTap() {
			longTapTimeout = null;
			touch.el.trigger('longTap');
			touch.longTap = true;
			touch = {};
		}

		function cancelLongTap() {
			if (longTapTimeout) { clearTimeout(longTapTimeout)}
			longTapTimout = null;
		}
	};
})(Best);

;(function($) {
	$.fn.anim = function() {

	};
	$.fn.animate = function(obj, fn) { // (opacity:100)/marginLeft/marginTop/width/height
		if(this[0].timer) { clearInterval(this[0].timer); }
		var _this = this[0];
		this[0].timer = setInterval(function (){
			var stop = true;		
			for(var attr in obj) {
				var c = 0;
				c = attr == 'opacity' ? parseInt(parseFloat(getComputedStyle(_this, '')[attr]).toFixed(2) * 100) : 
					parseInt(getComputedStyle(_this, '')[attr]);
				var s = (obj[attr] - c) / 8;
				s = s > 0 ? Math.ceil(s) : Math.floor(s);
				if(c != obj[attr]) { stop = false; }
				
				if(attr == 'opacity') {
					_this.style.filter = 'alpha(opacity:' + (c + s) + ')';
					_this.style.opacity = (c + s)/100;
				} 
				else { _this.style[attr] = c + s + 'px'; }
			}
			
			if(stop) {
				clearInterval(_this.timer);
				if(fn) { fn(); }
			}
		}, 30);
	};
})(Best);
