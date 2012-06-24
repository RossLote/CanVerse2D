
function improvedSlice(array, start, end, interval){
    var tmp = [];
    end = (end < 0) ? array.length + end + 1 : end;
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
// start Rect
//
var CVRect = new Class({

    initialize: function(x,y,w,h){
        this.x = x;
        this.y = y;
        this.width = w;
        this.height = h;
        this.angle = 0;

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

        if(this.x > rect.right())return false;
        if(this.right() < rect.x)return false;
        if(this.y > rect.bottom())return false;
        if(this.bottom() < rect.y)return false;

        return true;
    },

    collideCircle: function(rect){
        //console.log(Math.pow((rect.center().x - this.center().x), 2)+Math.pow((rect.center().y - this.center().y), 2), Math.pow((rect.width/2))+(this.width/2), 2)
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
    click: function(){
        for(var i = 0; i < CVMasterGroup.length(); i++){
            if(CVMasterGroup.contents()[i].mouseOver){
                CVMasterGroup.contents()[i].triggerClickEvent();
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
            CVMasterGroup.contents()[i].mouseOver = CVMasterGroup.contents()[i].getRect().collidePoint(this.x, this.y);
        }
    },

    dblClick: function(){

    },

    mouseDown:function(){

    },

    mouseUp:function(){

    },

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

    setTransforms: function(params){
        this.transforms = params;
    },

    render: function(rect, offset){

        CVContext.save()

        CVContext.translate(rect.center().x, rect.center().y);
        CVContext.rotate(rect.angle);

        for(var tfm in this.transforms){
            if(tfm+'' == 'flip'){
                var arr = this.transforms[tfm].match(/[0-1]/g);
                var h = parseInt(arr[0]);
                var v = parseInt(arr[1]);
                //CVContext.translate(this.width * h, this.height * v);
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
            (-rect.width/2) + offset.x,
            (-rect.height/2) + offset.y,
            this.width,
            this.height);

        CVContext.restore();
    }
// end render
});
//
// end CVFixedImage
//

var CVDrawingSurface = new Class({
    Extends: CVFixedImage,

    initialize: function(params){
        this.transforms = {};
        this.draw = {};
        this.width = 1;
        this.height = 1;
        this.x = 0;
        this.y = 0;
        for(var arg in params){
            var string = 'this.' + arg + ' = params[arg]';
            eval(string);
        }

        this.generateImage();
    },
    // end initialize

    generateImage: function(){
        var tempCanvas = new Element('canvas',{
            styles: {
                'display' : 'none',
            },
            width: this.width,
            height: this.height
        });
        var tmpCtx = tempCanvas.getContext('2d');
        for(var i = 0; i < this.draw.length; i++){
            var string = 'tmpCtx.'+this.draw[i];
            eval(string);
        }
        this.image = new Image();
        this.image.src = tempCanvas.toDataURL();
    },

    setDrawSequence: function(seq){
        this.draw = seq;
        this.generateImage();
    },


})

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

    render: function(rect, offset){

        this.parent(rect, offset);

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

    initialize: function(params){
        this.mouseOver = false;
        this.groups = new Array();
        this.add(CVMasterGroup);
        this.imageOffset = {x: 0, y: 0};

        for(var arg in params){
            var string = 'this.' + arg + ' = params[arg]';
            eval(string);
        }
        if(!this.image){
            var image = new Image();
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
        return this.image.render(this.rect, this.imageOffset);
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
        this.killing = true;
        for(var i = 0; i < this.groups.length; i++){
            this.groups[i].remove(this);
        }
        this.killing = false;
    },
    // end kill

    triggerMouseOverEvent: function(){

    },
    // end mouseOverResponse

    removeFrom: function(group){
        var index = containsObject(group, this.groups);
        if(index > -1){
            if(this.killing){
                this.groups[index] = null;
                console.log('frome kill');
            }
            else{
                this.groups.splice(index, 1);
                console.log('from removeFrom');
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

CVGraphicsRefreshRate = 60;
CVUpdateRefreshRate = 60;
CVSeparateUpdateFunction = false;
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
function CVSetLoopFunction(fnc){
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
    if(CVSeparateUpdateFunction){
        CVUpdate();
    }
    CVRender();
}

function CVInit(){
    CVMouse = new CVMouseManager();
    CVKey = new KeyboardManager();
    CVCanvas.addEventListener('mousemove', function(evt){
        CVMouse.update(CVCanvas, evt);
    });
    CVCanvas.addEventListener('mousedown', function(evt){
        CVMouse.mouseDown(evt);
    });
    CVCanvas.addEventListener('mouseup', function(evt){
        CVMouse.mouseUp(evt);
    });
    CVCanvas.addEventListener('click', function(evt){
        CVMouse.click(evt);
    });
    CVCanvas.addEventListener('dblclick', function(evt){
        CVMouse.dblClick(evt);
    });
    window.addEventListener('keydown', function(evt){
        CVKey.keyDown(evt);
    });
    window.addEventListener('keyup', function(evt){
        CVKey.keyUp(evt);
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