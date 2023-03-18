can = document.getElementById("C")
glass = document.getElementById("G")
I = document.getElementById("I")
T = document.getElementById("T")
c = can.getContext("2d")
g = glass.getContext('2d');
rect = can.getBoundingClientRect()
cW = 0.7
cH = 1
cX = innerWidth
cY = innerHeight
stages = []
currentStage = 0
fX,fY,fW,fH;
xlim = [0,100]
ylim = [0,100]
md = false
r = 1
lw = 2*r
ew = 10*r
g.lineWidth = c.lineWidth = lw
g.lineCap = 'round'
var X0=0,Y0=0,X,Y
var pos = {"X":X,"Y":Y}
var pathX,pathY
var saves = []
var currentSlide = 1
var fX = 0
var fY = cY
var fW = cX
var fH = cY
var isCreate=true
var isFill=false
function snap(){
    return c.getImageData(0,0,cX,cY)
}
function put(img,dx=0,dy=0){
    c.putImageData(img,dx,dy)
}
function load(n=currentSlide-1){
    if(saves[n]){
        put(saves[n],0,0)
    } else {
        c.clearRect(0,0,cX,cY)
    }
    print(`Slide no. ${n}`)
    currentSlide = n
    stages.push(snap())
    currentStage++;
}
function Last(){
    load()
    currentSlide--
}
function pdf(){
    var doc = new jsPDF()
    for(var i=1;;i++){
        load(i)
        img = can.toDataURL("image/png")
        doc.addImage(img,"PNG",10,10) 
        if(i==saves.length-1){break;}
        doc.addPage()
    }

    doc.save(`DrawingPad_${(new Date()).toString()}`)
}
function save(n=currentSlide){
    if(n<=0){
        print("Remember: Only slides with positive integer indices will be used to make pdf")
    }
    saves[n] = snap()
    print(`Saved as slide no. ${n}`)
}
function Next(){
    currentSlide++
    load(currentSlide)
}
function undo(){
    if(currentStage){
        currentStage--
    }
    put(stages[currentStage],0,0)
}
function redo(){
    if(currentStage){
        currentStage++
    }
    put(stages[currentStage],0,0)
}
function run(){
    let s = I.value
    eval(s);
    console.log(s)
}
function print(t){
    T.innerText = t.toString()
    console.log(t)
}
function Dot(ctx=c,x=X,y=Y,size=r) {
    ctx.lineWidth = 0
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI*2, true);
    ctx.closePath();
    ctx.fill();
    ctx.lineWidth = lw
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
    pos.X = X
    pos.Y = Y
    return pos
}
function Create(){
    c.globalCompositeOperation = "source-over"
    c.lineWidth = lw
    c.lineCap = 'round'
}
function Erase(){
    c.globalCompositeOperation = "destination-out";
    c.lineWidth = ew
    c.lineCap = 'round'
}
function draw(){

//mouse
can.onmousedown = function(e) {
    if(e.button===2){return;}
    md=true;
    getPos(e)
    c.beginPath()
    c.moveTo(X,Y)
}
window.onmouseup = function(){
    if(md){c.stroke()}
    md=false;
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
    md = true
    pathX=[];
    pathY=[];
    getPos(e);
    Dot(c,X,Y,r);
    pathX.push(X)
    pathY.push(Y)
    e.preventDefault();
}
can.ontouchmove = function(e) { 
    if(!md){return;}
    getPos(e);
    Dot(c,X,Y,r); 
    pathX.push(X)
    pathY.push(Y)
    e.preventDefault();
}
window.ontouchend = function(){
    if(!md){return;}
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
function fill(){
can.ontouchstart = can.onmousedown = function(e) {
    md=true;
    getPos(e)
    X0 = X
    Y0 = Y
}
window.ontouchend = window.onmouseup = function(e){
    if(md){
    getPos(e)
    c.fillRect(X0,Y0,X-X0,Y-Y0)
    g.clearRect(0,0,cX,cY)}
    md=false;
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
function addStages(){
    currentStage++
    stages[currentStage] = snap()
    for(var i=currentStage+1;i<stages.length;i++){
        delete stages[i]
    }
}
function mathPos(x,y){
    x = fX + fW*(x-xlim[0])/(xlim[1]-xlim[0])
    y = fY - fH*(y-ylim[0])/(ylim[1]-ylim[0])
    return {
    'X' : x ,
    'Y' : y
    }
}
function GoTo(x,y){
    X = fX + fW*(x-xlim[0])/(xlim[1]-xlim[0])
    Y = fY - fH*(y-ylim[0])/(ylim[1]-ylim[0])
    c.moveTo(X,Y)
}
function LineTo(x,y){
    X = fX + fW*(x-xlim[0])/(xlim[1]-xlim[0])
    Y = fY - fH*(y-ylim[0])/(ylim[1]-ylim[0])
    c.lineTo(X,Y)
}
function Rect(x1,y1,x2,y2){
    var X1 = fX + fW*(x1-xlim[0])/(xlim[1]-xlim[0])
    var Y1 = fY - fH*(y1-ylim[0])/(ylim[1]-ylim[0])
    var X2 = fX + fW*(x2-xlim[0])/(xlim[1]-xlim[0])
    var Y2 = fY - fH*(y2-ylim[0])/(ylim[1]-ylim[0])
    c.strokeRect(X1,Y1,X2-X1,Y2-Y1)
}
function point(x,y){
    GoTo(x,y)
    Dot()
}
function plot(data){
    c.strokeRect(fX,fY-fH,fW,fH)
    var n = data.x.length
    if(n !== data.y.length){
        print("incompatible arrays")
        return;
    }
    c.beginPath()
    GoTo(data.x[0],data.y[0])
    for(var i=1;i<data.x.length;i++){
        LineTo(data.x[i],data.y[i])
    }
    c.stroke()
}
function CoE(){
    if(isCreate){
        Erase()
    } else {
        Create()
    }
    isCreate = !isCreate
}  
function DoF(){
    if(isFill){
        draw()
    } else {
        fill()
    }
    isFill = !isFill
}
var fList = {
    run,
    CoE,
    DoF,
    undo,
    redo,
    save,
    Next,
    Last,
}
var bList = {}
var Top = 0
var B
for (f in fList){
    B = document.createElement("button")
    B.innerText = f
    B.id = f
    B.onclick =fList[f]
    B.style.top = `${Top}px`
    Top += 30
    document.body.appendChild(B)
    bList[f]=B
}
function resize(s=cW){
    cW = s
    stages[currentStage] = snap()
    console.log(cX,cY)
    cX = window.innerWidth
    cY = window.innerHeight
    glass.width  = can.width  = cX 
    glass.height = can.height = cY
    I.style.right = T.style.right = `${cW*100}%`
    for(var b in bList){
        bList[b].style.left = `${(1-cW)*100 + 1}%`
    }
    put(stages[currentStage],0,0)
    c.lineWidth = lw
}
window.onresize=resize
window.addEventListener("pointerup",addStages)
resize()
if (navigator.userAgent.match(/Android/i)){
    I.style.pointerEvents='none'
    resize(1)
}
draw()

