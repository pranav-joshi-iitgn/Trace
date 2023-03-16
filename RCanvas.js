can = document.getElementById("C")
glass = document.getElementById("G")
I = document.getElementById("I")
T = document.getElementById("T")
rect = can.getBoundingClientRect()
cX = cY = 0
cW = 0.7
cH = 1
tH = 0.8
c = can.getContext("2d")
g = glass.getContext('2d');
md = false
r = 2
lw = 2*r
ew = 10*r
g.lineWidth = c.lineWidth = lw
g.lineCap = 'round'
md=false;
var X0,Y0,X,Y
pos = {"X":X,"Y":Y}
var pathX,pathY
saves = []
currentSlide = 1
function pdf(){
    var doc = new jsPDF()
    for(var i=1;;i++){
        c.putImageData(saves[i],0,0)
        img = can.toDataURL("image/png")
        doc.addImage(img,"PNG",10,10) 
        if(i==saves.length-1){break;}
        doc.addPage()
    }

    doc.save(`DrawingPad_${(new Date()).toString()}`)
}
function save(){
    saves.push(c.getImageData(0,0,cX,cY))
    print(`Saved as slide no. ${currentSlide}`)
    currentSlide++
}
function load(n=currentSlide-1){
    if(n<=0){
        print("Nothing to load")
        return;
    }
    c.putImageData(saves[n],0,0)
    currentSlide = n
}
function undo(){
    c.putImageData(saves[0],0,0)
}

function resize(){
    cX = innerWidth*cW
    cY = innerHeight*cH
    saves[0] = c.getImageData(0,0,cX,cY)
    glass.width  = can.width  = cX
    glass.height = can.height = cY
    c.putImageData(saves[0],0,0)
    c.lineWidth = lw
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
    c.lineWidth = 0
    c.beginPath();
    c.arc(x, y, size, 0, Math.PI*2, true);
    c.closePath();
    c.fill();
    c.lineWidth = lw
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

c.globalCompositeOperation = "source-over"
c.lineWidth = lw
c.lineCap = 'round'

//mouse
can.onmousedown = function(e) {
    if(e.button===2){return;}
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
can.ontouchstart = function(e) {
    pathX=[];
    pathY=[];
    getPos(e);
    Dot(c,X,Y,r);
    pathX.push(X)
    pathY.push(Y)
    e.preventDefault();
}
can.ontouchmove = function(e) { 
    getPos(e);
    Dot(c,X,Y,r); 
    pathX.push(X)
    pathY.push(Y)
    e.preventDefault();
}
window.ontouchend = function(){
    let l = pathX.length
    if(l===0){return;}
    c.beginPath()
    c.moveTo(pathX[0],pathY[0])
    for(var i=1;i<l;i++){
        c.lineTo(pathX[i],pathY[i])
    }
    c.stroke()
}
}

function erase(){
    draw()
    c.globalCompositeOperation = "destination-out";
    c.lineWidth = ew
    c.lineCap = 'round'
}

function clear(){
can.ontouchstart = can.onmousedown = function(e) {
    md=true;
    getPos(e)
    X0 = X
    Y0 = Y
}
window.ontouchend = window.onmouseup = function(e){
    md=false;
    getPos(e)
    c.clearRect(X0,Y0,X-X0,Y-Y0)
    g.clearRect(0,0,innerWidth,innerHeight)
}
can.ontouchmove = can.onmousemove = function(e){ 
    g.clearRect(X0,Y0,X-X0,Y-Y0)
    getPos(e);
    if (md) { 
        c.moveTo(X,Y)
        g.fillStyle = 'rgba(255, 99, 71, 0.2)'
        g.fillRect(X0,Y0,X-X0,Y-Y0)
    }
}
}

can.addEventListener("pointerdown",function(){
    saves[0] = c.getImageData(0,0,cX,cY)
})

draw()

