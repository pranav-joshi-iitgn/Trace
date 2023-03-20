const can = document.getElementById("C")
const glass = document.getElementById("G")
const I = document.getElementById("I")
const T = document.getElementById("T")
const c = can.getContext("2d")
const g = glass.getContext('2d');
const rect = can.getBoundingClientRect()
var cW = 1
var cH = 1
var cX = innerWidth
var cY = innerHeight
var stages = [c.getImageData(0,0,cX,cY)]
var currentStage = 0
var fX,fY,fW,fH;
var xlim = [0,100]
var ylim = [0,100]
var md = false
var r = 1
var lw = 2*r
var ew = 20*r
var Color = "black"
var Font = "20px serif"
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
var editor = false
var fingerDrawing = true
var bList = {}
function Remember(color=Color,Line_width=lw,Eraser_width=ew,font=Font){
    if(isFill){
        c.lineWidth = 0
    } else if(isCreate){
        c.lineWidth = lw = Line_width
    } else {
        c.lineWidth = ew = Eraser_width
    }
    g.lineWidth = ew
    c.lineCap = 'round'
    g.lineCap = 'round'
    g.fillStyle = 'rgb(255, 99, 71)'
    g.strokeStyle = 'rgb(255, 99, 71)'
    c.fillStyle = Color = color
    c.strokeStyle = Color = color
    c.font = Font = font
}
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
    addStages()
    print(`Slide no. ${n}`)
    currentSlide = n
}
function Last(){
    if(currentSlide==0){
        print("No slide before this.")
        return;
    }
    load()
}
function pdf(start=1,stop=saves.length-1){
    var doc = new jsPDF('l')
    for(var i=start;;i++){
        load(i)
        img = can.toDataURL("image/png")
        doc.addImage(img,"PNG",10,10) 
        if(i==stop){break;}
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
function show(i=500){
    currentSlide = 0
    ss = setInterval(function(){
        Next()
        if(currentSlide>=saves.length){
            clearInterval(ss)
        }
    },i)
}
function Copy(n=currentSlide){
    save()
    saves.push(saves[n])
    load(saves.length-1)
}
function insert(){
    saves.splice(currentSlide,0,snap())
}
function Del(n=currentSlide,howmany=1){
    saves.splice(n,howmany)
    load(saves.length)
}
function undo(){
    if(currentStage==1){
        bList["undo"].style.opacity = 0.5
    }
    if(currentStage==0){return;}
    currentStage--
    put(stages[currentStage],0,0)
    bList["redo"].style.opacity = 1

}
function redo(){
    if(currentStage==stages.length-2){
        bList["redo"].style.opacity = 0.5
    }
    if(currentStage>=stages.length-1){
        return;
    }
    currentStage++
    put(stages[currentStage],0,0)
    bList["undo"].style.opacity = 1
}
function clear(){
    c.clearRect(0,0,cX,cY)
    addStages()
}
function run(){
    let s = I.value
    eval(s);
    console.log(s)
    addStages()
}
function print(t){
    T.innerText = JSON.stringify(t)
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
    Remember()
}
function Erase(){
    c.globalCompositeOperation = "destination-out";
    Remember()
}
function draw(){
if(navigator.userAgent.match(/Android/i) || navigator.userAgent.match(/iPad/i)){
//Touch
can.ontouchstart = function(e) {
    if(e.touches[0].type=="direct" && !fingerDrawing){return;}
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
    addStages()
}} else {
//mouse
can.onmousedown = function(e) {
    if(e.button===2){return;}
    md=true;
    getPos(e)
    c.beginPath()
    c.moveTo(X,Y)
    g.beginPath()
    g.moveTo(X,Y)
}
window.onmouseup = function(){
    if(md){
        c.stroke()
        addStages()
    }
    g.stroke()
    g.clearRect(0,0,cX,cY)
    md=false;
}
can.onmousemove = function(e){ 
    Remember()
    getPos(e);
    if (md) { 
        c.lineTo(X,Y) 
        c.stroke()
        c.beginPath()
        c.moveTo(X,Y)
        g.lineTo(X,Y) 
        g.stroke()
        g.beginPath()
        g.moveTo(X,Y)
    }
}
can.ontouchstart= function(){}
can.ontouchmove=function(){}
window.ontouchend=function(){}
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
    g.clearRect(0,0,cX,cY)
    addStages()
    }
    md=false;
}
can.ontouchmove = can.onmousemove = function(e){ 
    g.clearRect(X0,Y0,X-X0,Y-Y0)
    getPos(e);
    if (md) { 
        c.moveTo(X,Y)
        Remember()
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
    bList["undo"].style.opacity = 1
    bList["redo"].style.opacity = 0.5
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
    X = fX + (fW*(x-xlim[0])/(xlim[1]-xlim[0]))
    Y = fY - (fH*(y-ylim[0])/(ylim[1]-ylim[0]))
    c.moveTo(X,Y)
}
function LineTo(x,y){
    X = fX + (fW*(x-xlim[0])/(xlim[1]-xlim[0]))
    Y = fY - (fH*(y-ylim[0])/(ylim[1]-ylim[0]))
    c.lineTo(X,Y)
}
function Rect(x,y,w,h){
    X = fX + fW*(x-xlim[0])/(xlim[1]-xlim[0])
    Y = fY - fH*(y-ylim[0])/(ylim[1]-ylim[0])
    var W = fW*(w)/(xlim[1]-xlim[0])
    var H = - fH*(h)/(ylim[1]-ylim[0])
    c.strokeRect(X,Y,W,H)
}
function point(x,y){
    GoTo(x,y)
    Dot()
}
function plot(data,x_range=xlim,y_range=ylim,Frame_Width = fW/cX,Frame_Height=fH/cY,Frame_Left=fX/cX,Frame_Bottom= 1 - fY/cY,frame=true){
    xlim = x_range
    ylim = y_range
    fW = Frame_Width * cX
    fH = Frame_Height * cY
    fX = Frame_Left * cX
    fY = (1 - Frame_Bottom) * cY
    var n = data.x.length
    if(n !== data.y.length){
        print("incompatible arrays")
        return;
    }

    switch (data.type) {

        case "scatter": 
            for(var i=0;i<n;i++){
                GoTo(data.x[i],data.y[i])
                Dot()
            }
            c.stroke()
            break;

        case "bar":
            for(var i=0;i<n;i++){
                Rect(data.x[i],0,data.width,data.y[i])
            }
            break;

        case "line":
        case undefined:
            c.beginPath()
            GoTo(data.x[0],data.y[0])
            for(var i=1;i<data.x.length;i++){
                LineTo(data.x[i],data.y[i])
            }
            c.stroke()
            break;

        default:
            print("Unrecognised type for plot")
    }

    if(frame){
        c.strokeRect(fX,fY-fH,fW,fH)
        var txt = `(${xlim[0]},${ylim[0]})`
        GoTo(xlim[0],ylim[0])
        c.fillText(txt,X-5*(txt.length),Y+20)
        txt = `(${xlim[1]},${ylim[1]})`
        GoTo(xlim[1],ylim[1])
        c.fillText(txt,X,Y)
    }
}
function fplot(x_range,y_range,n,f,FW = fW/cX,FH=fH/cY,FL=fX/cX,FB= 1 - fY/cY,Frame=true){
    print("fplot running")
    if(!y_range){
    var ymin = f(x_range[0])
    var ymax = f(x_range[1])
    }
    var dx = (x_range[1] - x_range[0])/n
    var x = []
    var y = []
    for(var i=0;i<=n;i++){
        y.push(f(x_range[0] + dx*i))
        x.push(x_range[0] + dx*i)
        if(!y_range){
        if(y[i]>ymax){ymax = y[i]}
        if(y[i]<ymin){ymin = y[i]}
        }
    }
    if(!y_range){y_range=[ymin,ymax]}
    data = {
        "x":x,
        "y":y,
        "type":"line",
    }
    plot(data,x_range,y_range,FW,FH,FL,FB,Frame)
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
function code(){
    if(editor){
        resize(0)
        T.style.visibility = "hidden"
        I.style.visibility = "hidden"
    } else {
        resize(0.3)
        T.style.visibility = "visible"
        I.style.visibility = "visible"
    }
    editor = !editor
}
function resize(s=1-cW,Top=0,Bottom=0){
    cW = 1-s
    stages[currentStage] = snap()
    console.log(cX,cY)
    cX = innerWidth
    cY = innerHeight
    fX = 0 
    fY = cY
    fW = cX
    fH = cY
    stages[0] = snap()
    glass.width  = can.width  = cX 
    glass.height = can.height = cY
    I.style.right = T.style.right = `${cW*100}%`
    for(var b in bList){
        bList[b].style.left = `${(1-cW)*100 + 1}%`
    }
    for (var b in buttonHigh){
        if(buttonHigh[b]){
            bList[b].style.top = `${Top}px`
            Top += 30
        } else{
            bList[b].style.bottom = `${Bottom}px`
            Bottom += 30
        }
    }
    put(stages[currentStage],0,0)
    Remember()
}
var actions = {
    run,
    Del,
    undo,
    redo,
    save,
    Next,
    Last,
    clear,
}
var toggles = {
    code,
    "Eraser":CoE,
}
var modes = {
    draw,
    fill,
}
var buttonHigh = {
    Del:false,
    code:false,
    run:false,
    clear:true,
    undo:true,
    redo:true,
    save:true,
    Next:true,
    Last:true,
    Eraser:true,
    draw:true,
    fill:true,
}
function createButton(id,fun){
    var But = document.createElement("button")
    But.innerText = id
    But.id = id
    But.color = "#f8f9f8"
    document.body.appendChild(But)
    bList[id]=But
    But.onclick = fun
    But.onmousemove = But.ontouchmove = function(e){e.preventDefault()}
}
for (var t in toggles){
    createButton(t,function(e){
        toggles[e.target.id]()
        if(e.target.color=="#f8f9f8"){
            e.target.style.background="#acd5c1"
            e.target.color = "#acd5c1"
        } else {
            e.target.color = "#f8f9f8"
            e.target.style.background="#f8f9f8"
        }
    })
}
for (var a in actions){
    createButton(a,function(e){actions[e.target.id]()})
}
for (var m in modes){
    createButton(m,function(e){
        modes[e.target.id]()
        for(var m in modes){
            bList[m].style.background="#f8f9f8"
        }
        e.target.style.background="#acd5c1"
    })
}
window.onresize=resize
bList["undo"].style.opacity = 0.5
bList["redo"].style.opacity = 0.5
resize()
if(!navigator.userAgent.match(/Android/i)){
    bList.code.click()   
}
bList.draw.click()
