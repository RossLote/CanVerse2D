function containsObject(obj, list) {
    var i;
    for (i = 0; i < list.length; i++) {
	if (list[i] === obj) {
	    return i;
	}
    }
    return -1;
}

//
// start Rect
//
var CVRect = new Class({

    initialize: function(x,y,w,h){
	if(CVDebugMode){
	    CVRectArray.push(this);
	}
	this.x = x;
	this.y = y;
	this.width = w;
	this.height = h;
	this.originalRect = {
	    x: this.x,
	    y: this.y,
	    width: this.width,
	    height: this.height,
	};
	this.offset = {
	    x: 0,
	    y: 0
	};
	this.angle = 0;

    },
    // end initialize

    update: function(){
	this.originalRect.x = this.x - this.offset.x;
	this.originalRect.y = this.y - this.offset.y;
    },

    rectBeforeOffset: function(){
	this.update();
	return this.originalRect;
    },

    setPos: function(arg){
	this.x = arg.x;
	this.y = arg.y;
    },

    scale: function(arg){
	this.width *= arg.x;
	this.height *= arg.x;
    },

    scaleAndReposition: function(arg){
	this.width *= arg.x;
	this.height *= arg.x;
	this.createOffset({
	    x: this.x + (this.originalRect.width - this.width)/2,
	    y: this.y + (this.originalRect.height - this.height)/2
	});
    },

    createOffset: function(arg){
	this.offset = arg;
    },

    getPoint: function(x, y){
	return {
	    x: this.x + x,
	    y: this.y + y
	};
    },

    top: function(){
	if(arguments.length){
	    this.x = arguments[0];
	}
	return this.y;
    },
    // end top

    topLeft: function(){
	if(arguments.length){
	    this.x = arguments[0].x;
	    this.y = arguments[0].y;
	}
	return {
	    x: this.x,
	    y: this.y
	};
    },

    topRight: function(){
	if(arguments.length){
	    this.x = arguments[0].x - this.width;
	    this.y = arguments[0].y;
	}
	return {
	    x: this.x + this.width,
	    y: this.y
	};
    },


    bottom: function(){
	if(arguments.length){
	    this.y = arguments[0] - this.height;
	}
	return this.y + this.height;
    },
    // end bottom

    bottomLeft: function(){
	if(arguments.length){
	    this.x = arguments[0].x;
	    this.y = arguments[0].y - this.height;
	}
	return {
	    x: this.x,
	    y: this.y + this.height
	};
    },

    bottomRight: function(){
	if(arguments.length){
	    this.x = arguments[0].x - this.width;
	    this.y = arguments[0].y - this.height;
	}
	return {
	    x: this.x + this.width,
	    y: this.y + this.height
	};
    },

    left: function(){
	if(arguments.length){
	    this.x = arguments[0];
	}
	return this.x;
    },
    // end left

    right: function(){
	if(arguments.length){
	    this.x = arguments[0] - this.width;
	}
	return this.x + this.width;
    },
    // end right

    center: function(){
	if(arguments.length){
	    this.x = arguments[0].x - (this.width/2);
	    this.y = arguments[0].y - (this.height/2);
	}
	return {
	    x: this.x + (this.width/2),
	    y: this.y + (this.height/2)
	};
    },
    // end center
    collidePoint: function(x, y){
	
	if(this.x > x)return false;
	if(this.right() < x)return false;
	if(this.y > y)return false;
	if(this.bottom() < y)return false;

	return true;
    },

    collideRect: function(rect){

	if(this.x > rect.right())return false;
	if(this.right() < rect.x)return false;
	if(this.y > rect.bottom())return false;
	if(this.bottom() < rect.y)return false;

	return true;
    },

    collideCircle: function(rect){
	return (Math.pow((rect.center().x - this.center().x), 2)+Math.pow((rect.center().y - this.center().y), 2)< Math.pow((rect.width/2)+(this.width/2), 2));
    }
});
//
// end Rect
//

//
// start Mouse
//
var CVMouseManager = new Class({

    initialize: function(){
	this.x = 0;
	this.y = 0;
    },
    // end initialize

    getPos: function(){
	return {
	    x: this.x,
	    y: this.y
	};
    },
    // end getPos

    updatePosition: function(canvas, evt){
	// get canvas position
	var obj = canvas;
	var top = 0;
	var left = 0;
	while (obj && obj.tagName != 'BODY') {
	    top += obj.offsetTop;
	    left += obj.offsetLeft;
	    obj = obj.offsetParent;
	}

	this.x = evt.clientX - left + window.pageXOffset;
	this.y = evt.clientY - top + window.pageYOffset;
    },
    // end update

    checkMouseOver: function(){
	for(var i = 0; i < CVMasterGroup.length(); i++){
	    CVMasterGroup.contents()[i].mouseOver = CVMasterGroup.contents()[i].getRect().collidePoint(this.x, this.y);
	}
    },
    
    triggerEvent: function(callback){
	for(var i = 0; i < CVMasterGroup.length(); i++){
	    if(CVMasterGroup.contents()[i].mouseOver){
		callback(CVMasterGroup.contents()[i]);
	    }
	}
    }

});
//
// end Mouse
//

var KeyboardManager = new Class({

    initialize: function(){
	this.keys = [];
	for(var i = 0; i < 255; i++){
	    this.keys.push(false);
	}
    },

    keyDown: function(evt){
	this.keys[evt.keyCode] = true;
    },

    keyUp: function(evt){
	this.keys[evt.keyCode] = false;
    }
});

//
// start SpriteGroup
//
var CVMasterSpriteGroup = new Class({

    initialize: function(){
	this.sprites = new Array();
	for(var i = 0; i < arguments.length; i++){
	    this.add(arguments[i]);
	}
    },
    // end init

    add: function(sprite){
	if(!this.has(sprite)){
	    this.sprites.push(sprite);
	    sprite.add(this);
	}
    },
    // end add

    contents: function(){
	return this.sprites;
    },
    // end copy

    empty: function(){
	this.sprites = new Array();
    },
    // empty

    has: function(sprite){
	return (containsObject(sprite, this.sprites) > -1) ? true : false;
    },
    // end has

    kill: function(sprite){
	if(this.has(sprite)){
	    sprite.kill();
	}
    },
    // end kill

    length: function(){
	return this.sprites.length;
    },
    // end length

    remove: function(sprite){
	if(this.has(sprite)){
	    var index = containsObject(sprite, this.sprites);
	    this.sprites.splice(index, 1);
	    sprite.removeFrom(this);
	}
    }
});

var CVSpriteGroup = new Class({
    Extends: CVMasterSpriteGroup,

    draw: function(){
	for(var i = 0; i < this.sprites.length; i++){
	    this.sprites[i].draw();
	}
    },
    // end draw

    update: function(){
	for(var i = 0; i < this.sprites.length; i++){
	    this.sprites[i].update();
	}
    }
// end update
});

//
// start CVFixedImage
//
var CVFixedImage = new Class({

    initialize: function(image){

	this.image = image;
	this.x = 0;
	this.y = 0;
	this.width = image.width;
	this.height = image.height;
	this.transforms = {};
    },
    // end initialize

    getRect: function(){
	return new CVRect(this.x, this.y, this.width, this.height);
    },

    setTransforms: function(params){
	this.transforms = params;
    },

    render: function(rect){

	CVContext.save();
	var imageRect = rect.rectBeforeOffset();
	CVContext.translate(imageRect.x + (imageRect.width/2), imageRect.y + (imageRect.height/2));
	CVContext.rotate(rect.angle);

	for(var tfm in this.transforms){
	    if(tfm+'' == 'flip'){
		var arr = this.transforms[tfm].match(/[0-1]/g);
		var h = parseInt(arr[0]);
		var v = parseInt(arr[1]);
		h = h ? -1: 1;
		v = v ? -1: 1;
		CVContext.scale(h, v);
	    }
	    else{
		var string = 'CVContext.' + tfm +this.transforms[tfm];
		eval(string);
	    }
	}

	CVContext.drawImage(
	    this.image,
	    this.x,
	    this.y,
	    this.width,
	    this.height,
	    -imageRect.width/2,
	    -imageRect.height/2,
	    this.width,
	    this.height);

	CVContext.restore();
    }
// end render
});
//
// end CVFixedImage
//

var CVSurface = new Class({
    Extends: CVFixedImage,

    initialize: function(){
	var args = arguments[0];
	this.transforms = {};
	this.width = 1;
	this.height = 1;
	this.x = 0;
	this.y = 0;

	for(var arg in args){
	    var string = 'this.' + arg + ' = args[arg]';
	    eval(string);
	}
    },
    // end initialize

    customShape: function(callback){
	var tempCanvas = new Element('canvas',{
	    width: this.width,
	    height: this.height
	});
	var tmpCtx = tempCanvas.getContext('2d');
	callback(tmpCtx);
	this.image = new Image();
	this.image.src = tempCanvas.toDataURL();
    },

    circle: function(){
	var args = arguments[0];
	var tempCanvas = new Element('canvas',
	{
	    width: this.width,
	    height: this.height
	});
	var outlineWidth = 1;
	var centerX = this.width/2;
	var centerY = this.height/2;
	var radius = centerX;
	var tmpCtx = tempCanvas.getContext('2d');
	tmpCtx.beginPath();
	if(args){
	    if(args.x && args.y){
		centerX = args.x;
		centerY = args.y;
	    }
	    if(args.radius){
		radius = args.radius;
	    }
	    if(args.outlineWidth){
		outlineWidth = args.outlineWidth;
	    }
	}
	tmpCtx.arc(centerX, centerY, radius - (outlineWidth/2), 0, 2 * Math.PI, false);
	if(args){
	    if(args.fill){
		tmpCtx.fillStyle = args.fill;
		tmpCtx.fill();
	    }
	    if(args.outline){
		tmpCtx.strokeStyle = args.outline;
		tmpCtx.lineWidth = outlineWidth;
		tmpCtx.stroke();
	    }
	    else{
		if(args.outlineWidth){
		    tmpCtx.strokeStyle = 'black';
		    tmpCtx.lineWidth = outlineWidth;
		    tmpCtx.stroke();
		}
	    }
	}
	else{
	    tmpCtx.strokeStyle = 'black';
	    tmpCtx.lineWidth = outlineWidth;
	    tmpCtx.stroke();
	}
	this.image = new Image();
	this.image.src = tempCanvas.toDataURL();
    },

    rect: function(){
	var args = arguments[0];
	var tempCanvas = new Element('canvas',
	{
	    width: this.width,
	    height: this.height
	});
	var outlineWidth = 1;
	var x = 0;
	var y = 0;
	var w = this.width;
	var h = this.height;
	var tmpCtx = tempCanvas.getContext('2d');
	tmpCtx.beginPath();
	if(args){
	    if(args.x && args.y){
		x = args.x;
		y = args.y;
	    }
	    if(args.width && args.height){
		w = args.width;
		h = args.height;
	    }
	    if(args.outlineWidth){
		outlineWidth = args.outlineWidth;
	    }
	}
	tmpCtx.rect(x, y, w, h);
	if(args){
	    if(args.fill){
		tmpCtx.fillStyle = args.fill;
		tmpCtx.fill();
	    }
	    if(args.outline){
		tmpCtx.StrokeStyle = args.outline;
		tmpCtx.lineWidth = outlineWidth;
		tmpCtx.stroke();
	    }
	    else{
		if(args.outlineWidth){
		    tmpCtx.StrokeStyle = 'black';
		    tmpCtx.lineWidth = outlineWidth;
		    tmpCtx.stroke();
		}
	    }
	}
	else{
	    tmpCtx.StrokeStyle = 'black';
	    tmpCtx.lineWidth = outlineWidth;
	    tmpCtx.stroke();
	}
	this.image = new Image();
	this.image.src = tempCanvas.toDataURL();
    },
});

//
// start CVAnimation
//
var CVAnimation = new Class({
    Extends: CVFixedImage,

    initialize: function(
	image,
	srcStartFrameX,
	srcStartFrameY,
	frameWidth,
	frameHeight,
	totalAnimationFrames,
	animationSpeed,
	loop
	){

	this.parent(image);
	this.framesX = (image.width / frameWidth) - 1;
	this.framesY = (image.height / frameHeight) - 1;
	this.startX = srcStartFrameX;
	this.startY = srcStartFrameY;
	this.width = frameWidth;
	this.height = frameHeight;
	this.frames = totalAnimationFrames - 1;
	this.animationSpeed = animationSpeed;
	this.loop = loop;
	this.reset();
    },
    // end initialize

    render: function(rect){

	this.parent(rect);

	if(this.currentFrame == this.frames){
	    if(this.loop){
		if(++this.animationCount >= this.animationSpeed){
		    this.calculateFrame();
		    this.animationCount = 0;
		}
	    }
	    else{
		this.animationEnded = true;
	    }
	}
	else{
	    if(++this.animationCount >= this.animationSpeed){
		this.calculateFrame();
		this.animationCount = 0;
	    }
	}

	return this.animationEnded;
    },
    // end render

    getNextFrame: function(){

	if(++this.currentFrame > this.frames){
	    this.currentFrame = 0;
	    this.currentFrameY = this.startY;
	    this.currentFrameX = this.startX;
	}
	else if(++this.currentFrameX > this.framesX){
	    this.currentFrameX = 0;
	    this.currentFrameY++;
	}
    },
    //end getNextFrame

    calculateFrame: function(){
	this.getNextFrame();

	this.x = this.currentFrameX * this.width;
	this.y = this.currentFrameY * this.height;
    },
    //end calculateFrame

    isAnimationComplete: function(){
	return this.animationEnded;
    },

    reset: function(){
	this.animationEnded = false;
	this.animationCount = 0;
	this.currentFrame = 0;
	this.currentFrameX = this.startX;
	this.currentFrameY = this.startY;
	this.x = this.currentFrameX * this.width;
	this.y = this.currentFrameY * this.height;
    }
// end reset
});
//
// end CVAnimation
//


//
// Start Sprite
//
var CVSprite = new Class({

    initialize: function(args){
	this.mouseOver = false;
	this.groups = new Array();
	this.add(CVMasterGroup);

	for(var arg in args){
            var string = 'this.' + arg + ' = args[arg]';
            eval(string);
        }
	
	if(!this.image){
	    var image = new Image();
	    image.width = image.height = 1;
	    this.image = new CVFixedImage(image);
	}
	if(!this.rect){
	    this.rect = this.image.getRect();
	}

    },
    // end init

    add: function(group){
	if(containsObject(group, this.groups) == -1){
	    this.groups.push(group);
	    group.add(this);
	}
    },
    // end add

    cleanGroupList: function(){
	var temp = [];
	for(var i = 0; i < this.groups.length; i++){
	    if(this.groups[i] !== null){
		temp.push(this.groups[i]);
	    }
	}
	this.groups = temp;
    },
    // end cleanGroupList

    draw: function(){
	return this.image.render(this.rect);
    },
    // end draw

    getPos: function(){
	return {
	    x: this.rect.x,
	    y: this.rect.y
	};
    },
    //end getPos

    getRect: function(){
	return this.rect;
    },
    // end getRect

    kill: function(){
	this.killing = true;
	for(var i = 0; i < this.groups.length; i++){
	    this.groups[i].remove(this);
	}
    },
    // end kill

    removeFrom: function(group){
	var index = containsObject(group, this.groups);
	if(index > -1){
	    if(this.killing){
		this.groups[index] = null;
	    }
	    else{
		this.groups.splice(index, 1);
	    }

	    group.remove(this);
	}
    },
    // end removeFrom

    setRect: function(x,y,width,height){
	this.rect.x = x;
	this.rect.y = y;
	this.rect.width = width;
	this.rect.height = height;
    },
    // end setRect

    setPos: function(x,y){
	this.rect.x = x;
	this.rect.y = y;
    },
    // end setPos

    clickEvent: function(){
	
    },
    // end clickEvent
    
    dblClickEvent: function(){
	
    },
    // end clickEvent
    
    mouseDownEvent: function(){
	
    },
    // end clickEvent
    
    mouseUpEvent: function(){
	
    },
    // end clickEvent

    update: function(){

    },
// end update
});
//
// end Sprite
//

CVGraphicsRefreshRate = 60;
CVUpdateRefreshRate = 60;
CVMouseEnabled = false;
CVKeyboardEnabled = false;
CVSeparateUpdateFunction = false;
CVDebugMode = false;
CVRectArray = new Array();
CVImages = {};
CVAudio = {};
CVMasterGroup = new CVMasterSpriteGroup();
CVCanvas = null;
CVContext = null;
function CVLoadResources(sources, callback) {
    var loadedAudio = 0;
    var loadedImages = 0;
    var numImages = 0;
    var numAudio = 0;
    for(var type in sources) {
        for(var src in sources[type]){
            if(type == 'audio'){
                numAudio++
            }
            else if(type == 'images'){
                numImages++
            }
        }
    }
    for(var type in sources) {
        for(var src in sources[type]){
            if(type == 'images'){
                CVImages[src] = new Image();
                CVImages[src].onload = function() {
                    if(++loadedImages >= numImages && loadedAudio >= numAudio) {
                        callback();
                    }
                };
                CVImages[src].src = sources[type][src];
            }
            else if(type == 'audio'){
                CVAudio[src] = new Audio();
                CVAudio[src].onload = function() {
                    if(++loadedAudio >= numAudio && loadedImages >= numImages) {
                        callback();
                    }
                };
                CVAudio[src].src = sources[type][src];
            }
        }
    }
}
function CVSetLoopFunction(fnc){
    CVLoopFunction = fnc;
}

function CVSetUpdateFunction(fnc){
    CVUpdateFunction = fnc;
}

function CVSetCanvas(canvas){
    CVCanvas = canvas;
    CVContext = CVCanvas.getContext('2d');
}

function CVRender(){
    requestAnimFrame(function(){
	CVRender();
    });
    if(CVMouseEnabled){
	CVMouse.checkMouseOver();
    }
    CVLoopFunction();
}

function CVUpdate(){
    CVUpdateFunction();
    CVUpdateLoop(function(){
	CVUpdate();
    });
}
function CVMainloop(){
    if(CVSeparateUpdateFunction){
	CVUpdate();
    }
    CVRender();
}

function CVClearCanvas(){
    CVContext.clearRect(0, 0, CVCanvas.width, CVCanvas.height);
}

function CVDrawRects(){
    for(var i = 0; i < CVRectArray.length; i++){
	CVContext.beginPath();
	CVContext.rect(CVRectArray[i].x,CVRectArray[i].y,CVRectArray[i].width,CVRectArray[i].height);
	CVContext.strokeStyle = 'green';
	CVContext.lineWidth = 2;
	CVContext.stroke();
    }
}

function CVInit(){
    if(CVMouseEnabled){
	CVMouse = new CVMouseManager();
	CVCanvas.addEventListener('mousemove', function(evt){
	    CVMouse.updatePosition(CVCanvas, evt);
	});
	CVCanvas.addEventListener('mousedown', function(evt){
	    CVMouse.triggerEvent(function(sprite){
		sprite.mouseDownEvent(evt);
	    });
	});
	CVCanvas.addEventListener('mouseup', function(evt){
	    CVMouse.triggerEvent(function(sprite){
		sprite.mouseUpEvent(evt);
	    });
	});
	CVCanvas.addEventListener('click', function(evt){
	    CVMouse.triggerEvent(function(sprite){
		sprite.clickEvent(evt);
	    });
	});
	CVCanvas.addEventListener('dblclick', function(evt){
	    CVMouse.triggerEvent(function(sprite){
		sprite.dblClickEvent(evt);
	    });
	});
    }
    if(CVKeyboardEnabled){
	CVKey = new KeyboardManager();
    
    
	window.addEventListener('keydown', function(evt){
	    CVKey.keyDown(evt);
	});
	window.addEventListener('keyup', function(evt){
	    CVKey.keyUp(evt);
	});
    }
}

requestAnimFrame = (function() {
    return window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function(/* function FrameRequestCallback */ callback, /* DOMElement Element */ element) {
	window.setTimeout(callback, 1000/60);
    };
})();

window.CVUpdateLoop = (function(callback){
    return function(callback){
	window.setTimeout(callback, 1000 / CVUpdateRefreshRate);
    };
})();