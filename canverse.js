function improvedSlice(array, start, end, interval){
    var tmp = [];
    interval = interval ? interval : 1;
    for(var i = start; i < end; i+=interval){
        tmp.push(array[i]);
    }
    return tmp;
}

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
// end containsObject (function)
//

//
// start Rect
//
var CVRect = new Class({

    initialize: function(x,y,w,h){
        this.x = x;
        this.y = y;
        this.width = w;
        this.height = h;

    },
    // end initialize

    top: function(){
        return this.y
    },
    // end top

    bottom: function(){
        return this.y + this.height
    },
    // end bottom

    left: function(){
        return this.x
    },
    // end left

    right: function(){
        return this.x + this.width
    },
    // end right

    center: function(){
        return {
            x: this.x + (this.width*0.5),
            y: this.y + (this.height*0.5)
        }
    },
    // end center
    collidePoint: function(x, y){
        return ((x > this.x && x < this.right()) && (y > this.y && y < this.bottom())) ? true : false;
    },

    collideRect: function(rect){
        var collide = false;
        if((this.width*0.5) + (rect.width*0.5) <= Math.abs(Math.abs(this.center().x)) - Math.abs(rect.center().x)){
            collide = ((this.width*0.5) + (rect.width*0.5) <= Math.abs(Math.abs(this.center().x)) - Math.abs(rect.center().x)) ? true: false;
        }
        return collide;

        //        var collide = false;
        //            if(this.center().x < rect.center().x){
        //                if(this.center().y < rect.center().y){
        //                    collide = ( (this.right() >= rect.x) && (this.bottom() >= rect.y) ) ? true : false;
        //                }
        //                else{
        //                    collide = ( (this.right() >= rect.x) && (this.y <= rect.bottom()) ) ? true : false;
        //                }
        //            }
        //            else{
        //                if(this.center().y < rect.center().y){
        //                    collide = ( (this.x <= rect.right()) && (this.bottom() >= rect.y) ) ? true : false;
        //                }
        //                else{
        //                    collide = ( (this.x <= rect.right()) && (this.y <= rect.bottom()) ) ? true : false;
        //                }
        //            }
        //
        //        return collide;
    },
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
    click: function(){
        for(var i = 0; i < CVMasterGroup.length(); i++){
            if(CVMasterGroup.copy()[i].mouseOver){
                CVMasterGroup.copy()[i].triggerClickEvent();
            }
        }
    },

    getPos: function(){
        return {
            x: this.x,
            y: this.y
        };
    },
    // end getPos

    update: function(canvas, evt){
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

        this.checkMouseOver();
    },
    // end update

    checkMouseOver: function(){
        for(var i = 0; i < CVMasterGroup.length(); i++){
            CVMasterGroup.copy()[i].mouseOver = CVMasterGroup.copy()[i].getRect().collidePoint(this.x, this.y);
        }
    }
});
//
// end Mouse
//

//
// start SpriteGroup
//
var CVMasterSpriteGroup = new Class({

    initialize: function(){
        this.sprites = new Array();
        for(var i = 0; i < arguments.length; i++){
            this.sprites.push(arguments[i]);
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

    copy: function(){
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
// start SpriteImage
//
var CVFixedImage = new Class({

    initialize: function(image){

        this.image = image;
        this.srcX = 0;
        this.srcY = 0;
        this.width = image.width;
        this.height = image.height;
        this.transforms = {};
    },
    // end initialize

    setTransforms: function(params){
        this.transforms = params;
    },

    render: function(destX, destY, destWidth, destHeight){

        CVContext.save()

        CVContext.translate(destX, destY);

        for(var tfm in this.transforms){
            //console.log(tfm);
            if(tfm+'' == 'flip'){
                var arr = this.transforms[tfm].match(/[0-1]/g);
                var h = parseInt(arr[0]);
                var v = parseInt(arr[1]);
                CVContext.translate(destWidth * h, destHeight * v);
                h = h ? -1: 1;
                v = v ? -1: 1;
                CVContext.scale(h, v);
            }
            else{
                var string = 'CVContext.' + tfm +this.transforms[tfm];
                //console.log(string);
                eval(string);
            }
        }

        CVContext.drawImage(
        this.image,
        this.srcX,
        this.srcY,
        this.width,
        this.height,
        0,
        0,
        destWidth,
        destHeight);

        CVContext.restore();
    }
    // end render
});
//
// end SpriteImage
//


//
// start Animation Manager
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

    render: function(destX, destY, destWidth, destHeight){

        this.parent(destX, destY, destWidth, destHeight);

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

        this.srcX = this.currentFrameX * this.width;
        this.srcY = this.currentFrameY * this.height;
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
        this.srcX = this.currentFrameX * this.width;
        this.srcY = this.currentFrameY * this.height;
    }
    // end reset
});
//
// end Animation Manager
//


//
// Start Sprite
//
var CVSprite = new Class({

    initialize: function(params){
        this.mouseOver = false;
        this.groups = new Array();
        this.add(CVMasterGroup);

        for(var arg in params){
            string = 'this.' + arg + ' = params[arg]';
            eval(string);
        }
        if(!this.image){
            image = new Image();
            image.width = image.height = 1;
            this.image = new CVFixedImage(image);
        }
        if(!this.rect){
            this.rect = new CVRect(0,0,0,0);
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

    clickResponse: function(){

    },

    draw: function(){
        return this.image.render(this.rect.x, this.rect.y, this.rect.width, this.rect.height);
    },
    // end draw

    getPos: function(){
        return {
            x: this.rect.x,
            y: this.rect.y
        }
    },
    //end getPos

    getRect: function(){
        return this.rect;
    },
    // end getRect

    kill: function(){
        for(var group in this.groups){
            group.remove(this);
        }
    },
    // end kill

    triggerMouseOverEvent: function(){

    },
    // end mouseOverResponse

    removeFrom: function(group){
        var index = containsObject(group, this.groups);
        if(index > -1){
            this.groups.splice(index, 1);
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

    triggerClickEvent: function(){

    },
    // end triggerClickEvent

    update: function(){

    },
    // end update
});
//
// end Sprite
//

CVGraphicsRefreshRate = 30;
CVUpdateRefreshRate = 30;
CVSeparateUpdateFunction = true;
CVImages = {};
CVMasterGroup = new CVMasterSpriteGroup();
CVCanvas = null;
CVContext = null;
function CVLoadResources(sources, callback) {
    var loadedImages = 0;
    var numImages = 0;
    // get num of sources
    for(var src in sources) {
        numImages++;
    }
    for(var src in sources) {
        CVImages[src] = new Image();
        CVImages[src].onload = function() {
            if(++loadedImages >= numImages) {
                callback();
            }
        };
        CVImages[src].src = sources[src];
    }
}
function CVSetGraphicsFunction(fnc){
    CVGraphicsFunction = fnc;
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
    CVGraphicsFunction();
}

function CVUpdate(){
    CVUpdateFunction();
    //console.log('update');
    CVUpdateLoop(function(){
        CVUpdate();
    });
}
function CVMainloop(){
    CVRender();
    if(CVSeparateUpdateFunction){
        CVUpdate();
    }
}

function CVInit(){
    CVMouse = new CVMouseManager();
    CVCanvas.addEventListener('mousemove', function(evt){
        CVMouse.update(CVCanvas, evt);
    });
    CVCanvas.addEventListener('mousedown', function(evt){
        CVMouse.click();
    });
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