can = document.getElementById("C")
glass = document.getElementById("G")
I = document.getElementById("I")
T = document.getElementById("T")
Div = document.getElementById("Div")
rect = can.getBoundingClientRect()
cX = cY = 0
cW = 0.7
cH = 1
tH = 0.8
c = can.getContext("2d")
g = glass.getContext('2d');
md = false
r = 3
c.lineWidth = 2*r
g.lineWidth = 2*r
md=false;
var X0,Y0,X,Y
pos = {"X":X,"Y":Y}
var pathX,pathY

function resize(){
    cX = innerWidth*cW
    cY = innerHeight*cH
    c0 = c.getImageData(0,0,cX,cY)
    glass.width  = can.width  = cX
    glass.height = can.height = cY
    c.putImageData(c0,0,0)
}
window.onresize=resize

function run(){
    let s = I.value
    eval(s);
    console.log(s)
}
function print(t){
    T.innerText = t
}
resize()

function Dot(c,x=X,y=Y,size=r) {
    c.beginPath();
    c.arc(x, y, size, 0, Math.PI*2, true);
    c.closePath();
    c.fill();
}
function getPos(e) {
    if (e.touches) {
        if (e.touches.length == 1) { // Only deal with one finger
            var touch = e.touches[0]; // Get the information for finger #1
            X=touch.pageX
            Y=touch.pageY
        }
    }
    else if (e.offsetX) {
        X = e.offsetX;
        Y = e.offsetY;
    }
    else if (e.layerX) {
        X = e.layerX;
        Y = e.layerY;
    }
    pos.X = X = (cX/cW) * (X - rect.left) / window.innerWidth
    pos.Y = Y = (cY/cH) * (Y - rect.top) / window.innerHeight
    return pos
}

function draw(){

//mouse
can.onmousedown = function(e) {
    md=true;
    getPos(e)
    c.beginPath()
    c.moveTo(X,Y)
}
window.onmouseup = function(){
    md=false;
    c.stroke()
}
can.onmousemove = function(e){ 
    getPos(e);
    if (md) { 
        c.lineTo(X,Y) 
        c.stroke()
        c.beginPath()
        c.moveTo(X,Y)
    }
}

//Touch
can.addEventListener("touchstart" ,function(e) {
    pathX=[];
    pathY=[];
    getPos(e);
    Dot(c,X,Y,r);
    pathX.push(X)
    pathY.push(Y)
    e.preventDefault();
})
can.addEventListener("touchmove",function(e) { 
    getPos(e);
    Dot(c,X,Y,r); 
    pathX.push(X)
    pathY.push(Y)
    e.preventDefault();
})
window.addEventListener("touchend" ,function(){
    let l = pathX.length
    if(l===0){return;}
    c.beginPath()
    c.moveTo(pathX[0],pathY[0])
    for(var i=1;i<l;i++){
        c.lineTo(pathX[i],pathY[i])
    }
    c.stroke()
})
}

function clear(){
can.ontouchstart = can.onmousedown = function(e) {
    md=true;
    getPos(e)
    X0 = X
    Y0 = Y
}
window.ontouchmove = window.onmouseup = function(e){
    md=false;
    getPos(e)
    c.clearRect(X0,Y0,X-X0,Y-Y0)
    g.clearRect(0,0,innerWidth,innerHeight)
}
can.ontouchend = can.onmousemove = function(e){ 
    g.clearRect(X0,Y0,X-X0,Y-Y0)
    getPos(e);
    if (md) { 
        c.moveTo(X,Y)
        g.fillStyle = 'rgba(255, 99, 71, 0.2)'
        g.fillRect(X0,Y0,X-X0,Y-Y0)
    }
}
}

draw()

