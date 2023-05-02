const opqt = "\u201C"
const clqt = "\u201D"
const and = "\u0026"
const neq = "\u2260"
const alpha = "\u03B1"
const beta = "\u03B2"
const gamma = "\u03B3"
const Gamma = "\u0393"
const Theta = "\u0398"
const SUM = "\u03A3"
const can = document.getElementById("C")
const glass = document.getElementById("G")
const onion = document.getElementById("O")
const I = document.getElementById("I")
const T = document.getElementById("T")
const D = document.getElementById("D")
const In = document.getElementById('In')
const Im = document.getElementById('Im')
const Coord = document.getElementById('Coord')
const c = can.getContext("2d")
const g = glass.getContext('2d');
const o = onion.getContext('2d');
const rect = can.getBoundingClientRect()
var cW = 1
var cH = 1
var cX = innerWidth
var cY = innerHeight
var stages = [c.getImageData(0,0,cX,cY)]
var currentStage = 0
var xlim = [0,100]
var ylim = [0,100]
var md = false
var r = 1
var lw = 2*r
var ew = 20*r
var Color = "black"
var Font = "20px serif"
var X0=0,Y0=0,X,Y
var pathX,pathY
var slides = [c.getImageData(0,0,cX,cY)]
var slideCodes = [""]
var currentSlide = 1
var fX = cX/2 + 30 
var fY = cY - 50
var fW = cX/2  - 100
var fH = cY - 100
var fingerDrawing = true //If set to true, allows user to draw with finger (stylus input is not changed by this)
var Onion = false //If set to true, enables the Onion mode
var bList = {} //list that will contain buttons
var scale = 1 //zoom
var tempD = {}
var dc = 'rgb(248, 249, 248)' //default color
var ac = 'rgb(172, 213, 193)' //active color
var selected = null
var selH = 0
var selW = 0
var TXT = ''
/**
 * Changes global variables applies corresponding changes to html elements
 * @param {*} color New value for variable Color
 * @param {*} Line_width New value for variable lw
 * @param {*} Eraser_width New value of variable ew
 * @param {*} font New value of variable Font
 */
function Remember(color=Color,Line_width=lw,Eraser_width=ew,font=Font){
    if(bList["Eraser"].style.background==ac){
        g.lineWidth = c.lineWidth = ew = Eraser_width
    } else {
        g.lineWidth = c.lineWidth = lw = Line_width
        g.lineWidth *= 3
    }
    c.lineCap = 'round'
    g.lineCap = 'round'
    g.fillStyle = 'rgb(255, 99, 71)'
    g.strokeStyle = 'rgb(255, 99, 71)'
    c.fillStyle = Color = color
    c.strokeStyle = Color = color
    c.font = Font = font
}
/**
 * @returns A photo (ImageData) of the full active canvas 
 */
function snap(){
    return c.getImageData(0,0,cX,cY)
}
/**
 * Puts ImageData on canvas
 * @param {*} img ImageData to be put
 * @param {*} dx X position of top left corner of image
 * @param {*} dy Y position of top left corner of image
 * @param {*} ctx context of canvas to put image on.
 */
function put(img,dx=0,dy=0,ctx = c){
    ctx.putImageData(img,dx,dy)
}
/**
 * Loads a slide(ImageData) from the slides list and the corresponding code (string) from SlideCodes and saves the change in the stages list.
 * @param {*} n Index of slide to be loaded
 */
function load(n=currentSlide-1){
    if(slides[n]){
        put(slides[n],0,0)
        I.value = slideCodes[n]
    } else {
        c.clearRect(0,0,cX,cY)
        I.value = ""
    }
    currentStage = -1
    addStages()
    disableButton("undo")
    T.value = `Slide ${n} from ${slides.length-1}\n`
    currentSlide = n
}
function Last(){
    if(currentSlide==0){
        print("No slide before this.")
        return;
    }
    load()
}
/**
 * Makes a pdf with slides on different pages.
 * @param {*} start Starting slide's index
 * @param {*} stop Last slide's index
 */
function pdf(start=1,stop=slides.length-1){
    var doc = new jsPDF('l')
    for(var i=start;;i++){
        load(i)
        img = can.toDataURL("image/png")
        doc.addImage(img,"PNG",10,10) 
        if(i>=stop){break;}
        doc.addPage()
    }
    doc.save(`Trace_${(new Date()).toString()}`)
}
/**
 * Saves (overwrites) the slides and codes to localStorage
 * @param {*} start Starting slide
 * @param {*} stop Last slide
 */
function save_locally(start=1,stop=slides.length-1){
    for(var i=start;i<=stop;i++){
        load(i)
        img = can.toDataURL("image/png")
        localStorage.setItem(i.toString(),img)
        localStorage.setItem(`c${i}`,I.value)
    }
}
/**
 * Loads slides and codes from localStorage
 * @param {*} start Starting slide
 * @param {*} stop Last slide
 */
function load_local(start=1,stop=Math.floor(localStorage.length/2)){
    if(start>stop){load(stop);return;}
    var im = new Image()
    var txt = localStorage.getItem(`c${start}`)
    im.onload = function(){
        load(start)
        c.drawImage(im,0,0)
        save()
        slideCodes[start] = txt
        start++
        load_local(start,stop)
    }
    im.src = localStorage.getItem(start)
}
/**Clears the localStorage */
function delete_local(){
    localStorage.clear()
}
/**
 * Saves the slide and code associated with it in the slides and slideCodes array
 * @param {*} n The slide to save
 */
function save(n=currentSlide){
    T.value = ""
    if(Onion){
        put(snap(),0,0,o)
        print("Onion is on.")
    } else {
        o.clearRect(0,0,cX,cY)
        print("Onion is off.")
    }
    if(n<=0){
        print("Remember: Only slides with positive integer indices will saved/exported by default")
    }
    slides[n] = snap()
    slideCodes[n] = I.value
    print(`Saved as slide no. ${n}`)
}
/**Next slide (and code)*/
function Next(){
    currentSlide++
    load(currentSlide)
}
/**
 * Does a slide show
 * @param {*} i The duration of each slide (in ms)
 */
function show(i=500){
    currentSlide = 0
    ss = setInterval(function(){
        Next()
        if(currentSlide>=slides.length){
            clearInterval(ss)
        }
    },i)
}
/**
 * Function Animation
 * @param {*} f list of functions to call
 * @param {*} n list of number of times function is called
 * @param {*} T list of durations for which animation runs
 * @param {*} dt list of intervals between function calls
 */
function funcAnim(f,n=[100],T=[5000],dt=[false],i=0){
    if(!dt[i]){
        dt[i] = T[i]/n[i]
    }
    disableButton("run")
    fa = setInterval(function(){
        if(f[i]){
            f[i]();
        }
        n[i]--;
        if(n[i]<=0){
            enableButton("run")
            clearInterval(fa)
            if(i<f.length-1){
                funcAnim(f,n,T,dt,i+1)
            }
        }
    },dt[i])
}
function Copy(n=currentSlide){
    save()
    slides.push(slides[n])
    slideCodes.push(slideCodes[n])
    load(slides.length-1)

}
/** saves current stage of canvas to a slide inserted next to current slide */
function insert(){
    slides.splice(currentSlide,0,snap())
    slideCodes.splice(currentSlide,0,I.value)
}
/**
 * Deletes slides
 * @param {*} n first slide to delete
 */
function Del(n=currentSlide,howmany=1){
    slides.splice(n,howmany)
    slideCodes.splice(n,howmany)
    load(slides.length)
}
function disableButton(b){
    bList[b].style.opacity = 0.5
    bList[b].disabled = true
}
function enableButton(b){
    bList[b].style.opacity = 1
    bList[b].disabled = false
}
function undo(){
    if(currentStage<=1){
        disableButton("undo")
    }
    currentStage--
    put(stages[currentStage],0,0)
    enableButton("redo")

}
function redo(){
    if(currentStage>=stages.length-2){
        disableButton("redo")
    }
    currentStage++
    put(stages[currentStage],0,0)
    enableButton("undo")
}
/**
 * Clears the canvas
 * @param {*} ctx context of canvas to clear
 * @param {*} fast set true in case of animation
 */
function clear(ctx=c,fast=false){
    ctx.clearRect(0,0,cX,cY)
    if(!fast){
        addStages()
    }
}
/**
 * Clears the frame given by the fX,fY,fH,fW values
 * @param {*} fast Set true in case of animation to improve performance
 */
function clrF(fast=false){
    c.clearRect(fX,fY-fH,fW,fH)
    if(!fast){
        addStages()
    }
}
function run(){
    let s = I.value
    T.value = ""
    eval(s);
    addStages()
}
function print(t,log = true){
    if(typeof t !="string"){t = JSON.stringify(t)}
    T.value += t + "\n"
    if(log){
        console.log(t)
    }
}
/**
 * Fills a circle (dot)
 * @param {*} ctx context of canvas 
 * @param {*} x x coordinate of center of dot
 * @param {*} y y coordinate of center of dot
 * @param {*} size radius of dot
 */
function Dot(ctx=c,x=X,y=Y,size=false) {
    var l = ctx.lineWidth
    if(size===false){
        size = l/2
    }
    ctx.lineWidth = 0
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI*2, true);
    ctx.closePath();
    ctx.fill();
    ctx.lineWidth = l
}
/**
 * Updates the pointer position (X,Y) based on mouse or touch event
 * @param {*} e Event
 * @returns False if event is not of interest
 */
function getPos(e) {
    if (e.touches) {
        if(e.touches.length > 1){return false}
        if (e.touches.length == 1) { // Only deal with one finger
            var touch = e.touches[0]; // Get the information for finger #1
            X=touch.pageX /scale
            Y=touch.pageY /scale
        }
    }
    else if (e.offsetX) {
        //console.log("offset")
        //console.log(e.offsetX + "," + e.offsetY)
        //console.log("layerX,layerY")
        //console.log(e.layerX + "," + e.layerY)
        //console.log("pageX,pageY")
        //console.log(e.pageX + "," + e.pageY)
        X = e.offsetX;
        Y = e.offsetY;
    }
    else if (e.layerX) {
        //console.log("layerX,layerY")
        //console.log(e.layerX + "," + e.layerY)
        //console.log("offset")
        //console.log(e.offsetX + "," + e.offsetY)
        //console.log("pageX,pageY")
        //console.log(e.pageX + "," + e.pageY)
        X = e.layerX;
        Y = e.layerY;
    }
    Coord.innerText = `X:${X},Y:${Y}`;
    return true
}
/** Switch to free-hand drawing*/
function draw(){
if(navigator.userAgent.match(/Android/i) || navigator.userAgent.match(/iPad/i)){
//Touch
can.ontouchstart = function(e) {
    if(e.touches[0].radiusX>0 && !fingerDrawing){return;}
    if(!getPos(e)){return;}
    md = true
    pathX=[];
    pathY=[];
    Dot(g,X,Y);
    pathX.push(X)
    pathY.push(Y)
    e.preventDefault();
}
can.ontouchmove = function(e) { 
    if(!getPos(e)){return;};
    if(!md){return;}
    Dot(g,X,Y); 
    pathX.push(X)
    pathY.push(Y)
    e.preventDefault();
}
window.ontouchend = function(){
    if(md){
    let l = pathX.length
    if(l===0){return;}
    c.beginPath()
    c.moveTo(pathX[0],pathY[0])
    for(var i=1;i<l;i++){
        c.lineTo(pathX[i],pathY[i])
    }
    c.stroke()
    clear(g)
    }
    md = false
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
        clear(g)
        g.stroke()
    }
    md=false;
}
can.onmousemove = function(e){ 
    //Remember()
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
/** Switch to rectangle fill */
function fill(im=false){
can.ontouchstart = can.onmousedown = function(e) {
    if(!getPos(e)){return;}
    md=true;
    X0 = X
    Y0 = Y
    W = 0
    H = 0
    e.preventDefault()
}
window.ontouchend = window.onmouseup = function(e){
    if(md){
    getPos(e)
    if(im){
        c.drawImage(im,X0,Y0,W,H)
    } else {
        c.fillRect(X0,Y0,W,H)
    }
    g.clearRect(0,0,cX,cY)
    addStages()
    }
    md=false;
}
can.ontouchmove = can.onmousemove = function(e){ 
    g.clearRect(X0,Y0,W,H)
    if(!getPos(e)){return;}
    W = X-X0
    H = Y-Y0
    if (md) { 
        c.moveTo(X,Y)
        g.fillRect(X0,Y0,W,H)
    }
}
}
function putSelected(){
    can.ontouchstart = can.onmousedown = function(e) {
        if(!getPos(e)){return;}
        X0 = X
        Y0 = Y
        md=true;
        e.preventDefault()
    }
    window.ontouchend = window.onmouseup = function(e){
        if(md){
        getPos(e)
        g.clearRect(0,0,cX,cY)
        c.putImageData(selected,X,Y)
        addStages()
        }
        md=false;
    }
    can.ontouchmove = can.onmousemove = function(e){ 
        g.clearRect(X0,Y0,selW,selH)
        if(!getPos(e)){return;}
        X0 = X
        Y0 = Y
        if (md) { 
            c.moveTo(X0,Y0)
            g.fillRect(X0,Y0,selW,selH)
        }
    }
}
/**
 * Puts text. If called after another text(), puts text below previous text.
 * @param {*} txt Text to be put on canvas
 * @param {*} x Position of text's left edge
 * @param {*} y Position of text's baseline
 */
function text(txt,x=X,y=Y){
    var measure = c.measureText(txt)
    var h = measure.actualBoundingBoxAscent + measure.actualBoundingBoxDescent
    y += measure.actualBoundingBoxAscent
    var lines = getLines(txt)
    for(var i=0; i<lines.length;i++){
        c.fillText(lines[i],x,y)
        y += h
    }
}
function getLines(txt){
    var measure = c.measureText(txt)
    var h = measure.actualBoundingBoxAscent + measure.actualBoundingBoxDescent
    var w = 0
    var neww = 0
    var lines = txt.split('\n')
    for(var i=0;i<lines.length;i++){
        neww = c.measureText(lines[i]).width
        if(neww>w){
            w = neww
        }
    }
    h = h * lines.length
    lines.w = w
    lines.h = h
    return lines
}
function putText(){
    can.ontouchstart = can.onmousedown = function(e) {
        if(!getPos(e)){return;}
        X0 = X
        Y0 = Y
        lines = getLines(TXT)
        selH = lines.h
        selW = lines.w
        md=true;
        e.preventDefault()
    }
    window.ontouchend = window.onmouseup = function(e){
        if(md){
        getPos(e)
        g.clearRect(0,0,cX,cY)
        //c.fillText(TXT,X0,Y0+measure.actualBoundingBoxAscent)
        text(TXT,X0,Y0)
        addStages()
        }
        md=false;
    }
    can.ontouchmove = can.onmousemove = function(e){ 
        g.clearRect(X0,Y0,selW,selH)
        if(!getPos(e)){return;}
        X0 = X
        Y0 = Y
        if (md) { 
            c.moveTo(X0,Y0)
            g.fillRect(X0,Y0,selW,selH)
        }
    }
}
document.getElementById("Color").onchange = function(e){
    Color = e.target.value
    Remember()
}
document.getElementById("LineWidth").onchange = function(e){
    lw = e.target.value
    print(lw)
    Remember()
}

function select(){
    can.ontouchstart = can.onmousedown = function(e) {
        if(!getPos(e)){return;}
        md=true;
        X0 = X
        Y0 = Y
        e.preventDefault()
    }
    window.ontouchend = window.onmouseup = function(e){
        if(md){
        getPos(e)
        selW = X-X0
        selH = Y-Y0
        selected = c.getImageData(X0,Y0,selW,selH)
        g.clearRect(0,0,cX,cY)
        addStages()
        }
        md=false;
    }
    can.ontouchmove = can.onmousemove = function(e){ 
        g.clearRect(X0,Y0,X-X0,Y-Y0)
        if(!getPos(e)){return;}
        if (md) { 
            c.moveTo(X,Y)
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
    enableButton("undo")
    disableButton("redo")
}
/**Converts the position of a point (x,y) as seen in the frame, to position as seen in the canvas  */
function realPos(x,y){
    x = fX + fW*(x-xlim[0])/(xlim[1]-xlim[0])
    y = fY - fH*(y-ylim[0])/(ylim[1]-ylim[0])
    return {
    'X' : x ,
    'Y' : y
    }
}
/**Similar to c.moveTo but uses position as seen in frame*/
function GoTo(x,y){
    X = fX + (fW*(x-xlim[0])/(xlim[1]-xlim[0]))
    Y = fY - (fH*(y-ylim[0])/(ylim[1]-ylim[0]))
    c.moveTo(X,Y)
}
/**Similar to c.lineTo but uses position as seen in frame */
function LineTo(x,y){
    X = fX + (fW*(x-xlim[0])/(xlim[1]-xlim[0]))
    Y = fY - (fH*(y-ylim[0])/(ylim[1]-ylim[0]))
    c.lineTo(X,Y)
}
/**Similar to c.strokeRect but uses position as seen in frame */
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
/**
 * 2D plots
 * @param {*} data object with x,y properties being arrays of coordinates of points
 * @param {*} x_range [x_low,x_high] The x values shown at edges of frame
 * @param {*} y_range [y_low,y_high] The y values shown at edges of frame
 * @param {*} frame If true, draws the frame
 */
function plot(data,x_range=xlim,y_range=ylim,frame=false){
    xlim = x_range
    ylim = y_range
    var n = data.x.length
    if(n !== data.y.length){
        print("incompatible arrays")
        return;
    }

    switch (data.type) {

        case "scatter": 
            for(var i=0;i<n;i++){
                GoTo(data.x[i],data.y[i])
                if(data.color){c.fillStyle=data.color[i]}
                if(data.r){Dot(c,X,Y,data.r[i])}
                else{Dot()}
            }
            break;

        case "bar":
            for(var i=0;i<n;i++){
                Rect(data.x[i],0,data.width,data.y[i])
                if(data.color){c.fillStyle=data.color[i];c.fill()}
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
    Remember()
    if(frame){Frame()}
}
/**
 * Draws the frame
 * @param {*} Frame_Left fraction of cX
 * @param {*} Frame_Bottom fraction of cY
 * @param {*} Frame_Width fraction of cX
 * @param {*} Frame_Height fraction of cY
 */
function Frame(Frame_Left=fX/cX,Frame_Bottom= 1 - fY/cY,Frame_Width = fW/cX,Frame_Height=fH/cY){
    fW = Frame_Width * cX
    fH = Frame_Height * cY
    fX = Frame_Left * cX
    fY = (1 - Frame_Bottom) * cY
    c.strokeRect(fX,fY-fH,fW,fH)
    var txt = `(${xlim[0]},${ylim[0]})`
    GoTo(xlim[0],ylim[0])
    c.fillText(txt,X-5*(txt.length),Y+20)
    txt = `(${xlim[1]},${ylim[1]})`
    GoTo(xlim[1],ylim[1])
    c.fillText(txt,X,Y)
}
/**
 * Plots a single variable, single valued function
 * @param {*} x_range [x_low,x_high] The x values shown at edges of frame
 * @param {*} y_range [y_low,y_high] The y values shown at edges of frame
 * @param {*} frame If true, draws the frame
 * @param {*} n number of samples to take 
 * @param {*} f function to plot
 */
function fplot(x_range,y_range,n,f,frame=false){
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
    plot(data,x_range,y_range,frame)
}
/**
 * Plots a 3D mesh
 * @param {*} data object with x,y properties being nested arrays of coordinates of points
 * @param {*} contour if true, draws the rows only, otherwise draws the columns too.
 * @param {*} x_range [x_low,x_high] : range of x values of points ON THE SCREEN
 * @param {*} y_range [y_low,y_high] : range of y values of points ON THE SCREEN
 * @param {*} z_eye z coordinate of your eye
 * @param {*} z_screen z coordinate of screen
 * @param {*} frame if true, draws frame
 */
function meshPlot(data,contour=false,x_range=xlim,y_range=ylim,z_eye=-1,z_screen=0,frame=false){
    xlim = x_range
    ylim = y_range
    if(data.x==undefined){
        print("You have put a data without x array. \n Assuming data is array of more data objects")
        for(var i=0;i<data.length;i++){meshPlot(data[i])}
        return;
    }
    var m = data.x.length
    if(m !== data.y.length){
        print("incompatible arrays")
        return;
    }
    var n = data.x[0].length
    if(n !== data.y[0].length){
        print("incompatible arrays")
        return;
    }
    var z = 1
    c.beginPath()
    for(var i=0;i<m;i++){
        if(data.z){var z = (data.z[i][0]-z_eye)/(z_screen-z_eye)}
        if(data.color){
            c.stroke()
            c.beginPath()
            c.strokeStyle=data.color[i]
        }
        GoTo(data.x[i][0]/z,data.y[i][0]/z)
        if(data.type=="scatter"){Dot(c,X,Y,lw/(2*z))}
        for(var j=1;j<n;j++){
            if(data.z){z = (data.z[i][j]-z_eye)/(z_screen-z_eye)}
            if(data.type=="scatter"){
                GoTo(data.x[i][j]/z,data.y[i][j]/z)
                Dot(c,X,Y,lw/(2*z))
            } else {
                LineTo(data.x[i][j]/z,data.y[i][j]/z)
            }
        }
    }
    if(!contour){
    for(var j=0;j<n;j++){
        if(data.z){var z = (data.z[0][j]-z_eye)/(z_screen-z_eye)}
        if(data.color){
            c.stroke()
            c.beginPath()
            c.strokeStyle=data.color[j]
        }
        GoTo(data.x[0][j]/z,data.y[0][j]/z)
        if(data.type=="scatter"){Dot(c,X,Y,lw/(2*z))}
        for(var i=1;i<m;i++){
            if(data.z){z = (data.z[i][j]-z_eye)/(z_screen-z_eye)}
            if(data.type=="scatter"){
                GoTo(data.x[i][j]/z,data.y[i][j]/z)
                Dot(c,X,Y,lw/(2*z))
            } else {
                LineTo(data.x[i][j]/z,data.y[i][j]/z)
            }
        }
    }
    }
    c.stroke()
    Remember()
    if(frame){Frame()}
}
/**
 * @param {*} A Angle of rotation (radians)
 * @param {*} W Axis of rotation (x,y,z). Not specifying axis will make the z axis the axis of rotation
 * @returns Transfomation function
 */
function RotM(A,W){
    return Matrix(RM(A,W))
}
/**
 * Transforms a "data" object using a function
 * @param {*} data mesh or line 
 * @param {*} f Transformation function that takes in array arr and index i and alters the value of arr[i]
 */
function Transform(data,f){
    for(var i=0;i<data.x.length;i++){
        if(typeof(data.x[i])==='object'){
            tempD.x = data.x[i]
            if(data.y){
                tempD.y = data.y[i]
            }
            if(data.z){
                tempD.z = data.z[i]
            }
            Transform(tempD,f)
        } else {
            f(data,i)
        }
}
}
/**
 * Converts a matrix into a transformation function
 * @param {*} M The matrix to be used
 * @returns A Transformation function
 */
function Matrix(M){
    return (function(data,i){
        if(M.length===2){
            //for(var i=0;i<data.x.length;i++){
                var x = data.x[i]
                var y = data.y[i]
                data.x[i] = M[0][0]*x + M[0][1]*y
                data.y[i] = M[1][0]*x + M[1][1]*y
            //}
        } else {
            //for(var i=0;i<data.x.length;i++){
                var x = data.x[i]
                var y = data.y[i]
                var z = data.z[i]
                data.x[i] = M[0][0]*x + M[0][1]*y + M[0][2]*z
                data.y[i] = M[1][0]*x + M[1][1]*y + M[1][2]*z
                data.z[i] = M[2][0]*x + M[2][1]*y + M[2][2]*z
            //}
        }
    })
}
/**
 * @param {*} A Angle of rotation (in radians)
 * @param {*} W Axis about which rotation should happen (x,y,z)
 * @returns A 3D or 2D rotation matrix
 */
function RM(A,W){
    var cA = Math.cos(A)
    var sA = Math.sin(A) 
    if(W){
        var x = W[0]
        var y = W[1]
        var z = W[2]
        var M = [[0,0,0],[0,0,0],[0,0,0]]
        var r = (x*x + y*y + z*z)**0.5
        x = x/r
        y = y/r
        z = z/r

        M[0][0] =  cA + x*x*(1-cA)
        M[0][1] = x*y*(1-cA) - z*sA
        M[0][2] = x*y*(1-cA) + y*sA

        M[1][0] = x*y*(1-cA) + z*sA
        M[1][1] = cA + y*y*(1-cA)
        M[1][2] = y*z*(1-cA) - x*sA

        M[2][0] = x*z*(1-cA) - y*sA
        M[2][1] = y*z*(1-cA) + x*sA
        M[2][2] = cA + z*z*(1-cA)

    } else {
        var M = [[cA,-sA],[sA,cA]]
    }
    return M
}
/**
 * Creates a grid (mesh)
 * @param {*} m number of rows
 * @param {*} n number of collumns
 * @param {*} x_range [x_low, x_high] : The x values between which grid is confined
 * @param {*} y_range [y_low, y_high] : The y values between which grid is confined
 * @param {*} type "2d" or "3d"
 * @returns An object with x,y properties containing the nested arrays of x coordinates and y coordinates of points
 */
function grid(m=10,n=10,x_range=xlim,y_range=ylim,type="3d"){
    m -= 1
    n -= 1
    if(type==="2d"){
        data = {x:[],y:[]}
        for(var i=0;i<=m;i++){
            var x = []
            var y = []
            for(var j=0;j<=n;j++){
                x.push((j*x_range[1]+(n-j)*x_range[0])/n)
                y.push((i*y_range[1]+(m-i)*y_range[0])/m)
            }
            data.x.push(x)
            data.y.push(y)
        }
        return data
    }
    if(type==="3d"){
        data = {x:[],y:[],z:[]}
        for(var i=0;i<=m;i++){
            var x = []
            var y = []
            var z = []
            for(var j=0;j<=n;j++){
                x.push((j*x_range[1]+(n-j)*x_range[0])/n)
                y.push((i*y_range[1]+(m-i)*y_range[0])/m)
                z.push(0)
            }
            data.x.push(x)
            data.y.push(y)
            data.z.push(z)
        }
        return data
    }

}
/**
 * Toggle eraser mode
 */
function Eraser(){
    if(bList["Eraser"].style.background==ac){
        c.globalCompositeOperation = "source-over"
    } else {
        c.globalCompositeOperation = "destination-out";
    }
}
/**
 * Shows or hides the code area
 */
function code(){
    if(bList["code"].style.background == ac){
        resize(0)
        T.style.visibility = "hidden"
        I.style.visibility = "hidden"
    } else {
        resize(0.5)
        T.style.visibility = "visible"
        I.style.visibility = "visible"
    }
}
/**
 * Shows or hides the "more" page
 */
function more(){
    if(D.style.zIndex > 0){
        D.style.zIndex = -2
        D.style.visibility = "hidden"
    } else {
        D.style.zIndex = 3
        D.style.visibility = "visible"
    }
    for(var i=0;i<D.children.length;i++){
        var el = D.children[i]
        if(el){
            if((el.style)&&(el.style.zIndex > 0)){
                el.style.zIndex = -2
                el.style.visibility = "hidden"
            } else {
                el.style.zIndex = 4
                el.style.visibility = "visible"
            } 
        }   
    }
}
/**
 * Tweaks the layout
 * @param {*} s Fraction of window width taken by code area
 * @param {*} Top Topmost position in button layout
 * @param {*} Bottom Bottom position in button layout
 * @param {*} canResize If true, defaults the zoom on resize
 */
function resize(s=1-cW,Top=0,Bottom=0,canResize=false){
    cW = 1-s
    stages[currentStage] = snap()
    if(canResize){
        scale = 1
        onion.style.transform = glass.style.transform = can.style.transform = `scale(${scale},${scale})`
    }
    cX = innerWidth
    cY = innerHeight
    fX = cX/2 + 30 
    fY = cY - 50
    fW = cX/2 - 120
    fH = cY - 100
    stages[0] = snap()
    onion.width  = glass.width  = can.width  = cX
    onion.height = glass.height = can.height = cY
    I.style.right = T.style.right = `${cW*100}%` //In.style.right = D.style.right = ..
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
    if(bList["Eraser"].style.background==ac){
        c.globalCompositeOperation = "destination-out";
    }
    Remember()
}
/**Zoom In*/
function zIn(){
    scale += 1
    can.style.transform = `scale(${scale},${scale})`
    glass.style.transform = `scale(${scale},${scale})`

}
/** Zoom Out*/
function zOut(){
    if(scale==1){return;}
    scale -= 1
    can.style.transform = `scale(${scale},${scale})`
    glass.style.transform = `scale(${scale},${scale})`
}
/**Enters full screen */
function full(){
    document.documentElement.requestFullscreen()
}
/**Exits full screen */
function esc(){
    document.exitFullscreen()
}
/**
 * Recursively renders pdf pages on canvas
 * @param {*} Pdf The pdf handle
 * @param {*} pg Page no.
 */
function Render(Pdf,pg=1){
    if(pg>Pdf._pdfInfo.numPages){return;}
    load(pg)
    Pdf.getPage(pg).then(function(page){
        var vp = page.getViewport({scale:1})
        var w = cX/vp.width
        var h = cY/vp.height
        if(h<w){
            vp = page.getViewport({scale:h})
        } else {
            vp = page.getViewport({scale:w})
        }
        page.render({
            canvasContext:c,
            viewport:vp,
        }).promise.then(function(){
            save()
            Render(Pdf,pg+1)
        })
    })
}
/**Import a PDF document*/
function Import(){
    var file = In.files[0];
    var fr = new FileReader();
    fr.onload = function(){
        var ta = new Uint8Array(this.result)
        pdfjsLib.getDocument(ta).promise.then(pdf =>{
            var l = pdf._pdfInfo.numPages
            console.log("this file has " + l);
            Render(pdf)
        })
    }
    fr.readAsArrayBuffer(file)
}
function Mutation(MData,m,useData=false){
    return function(IData,i){
        if(useData){m=IData.m}
        IData.x[i] = (1-m)*IData.x[i] + m*MData.x[i]
        if(IData.y){
            IData.y[i] = (1-m)*IData.y[i] + m*MData.y[i]
        }
        if(IData.z){
            IData.z[i] = (1-m)*IData.z[i] + m*MData.z[i]
        }
    }
}
//functions that perform an action
var actions = {
    run,
    Del,
    undo,
    redo,
    save,
    Next,
    Last,
    clear,
    zIn,
    zOut,
}
//functions that work as toggles
var toggles = {
    code,
    Eraser,
}
//functions that change the mode of interaction with canvas
var modes = {
    draw,
    fill,
}
//List of booleans telling if a certain button belongs to the upper section (in layout) or not
var buttonHigh = {
    
    zIn:true,
    zOut:true,
    Eraser:true,
    draw:true,
    fill:true,
    undo:true,
    redo:true,
    clear:true,

    code:false,
    run:false,
    Del:false,
    save:false,
    Next:false,
    Last:false,
}
/**
 * @param {*} id Id of button
 * @param {*} fun function to assign to button
 */
function createButton(id,fun){
    var But = document.createElement("button")
    But.id = id
    document.body.appendChild(But)
    bList[id]=But
    But.onclick = fun
    But.onmousemove = But.ontouchmove = function(e){
        if(md){e.preventDefault()}
    }
}
Im.onchange = function(e){
    im = new Image()
    im.src = URL.createObjectURL(e.target.files[0])
    bList['fill'].click()
    fill(im)
}
//Creating toggle buttons
for (var t in toggles){
    createButton(t,function(e){
        toggles[e.target.id]()
        if(e.target.style.background==ac){
            e.target.style.background=dc
        } else {
            e.target.style.background=ac
        }
        Remember()
    })
}
//Creating action buttons
for (var a in actions){
    createButton(a,function(e){actions[e.target.id]()})
}
//Creating mode change buttons (these work as radio buttons)
for (var m in modes){
    createButton(m,function(e){
        modes[e.target.id]()
        for(var m in modes){
            bList[m].style.background=dc
        }
        e.target.style.background=ac
    })
}
//Button icons
for(var b in bList){
    im = new Image()
    bList[b].appendChild(im)
    im.style.width = "100%"
    im.style.height = "100%"
    im.style.zIndex = 3
    im.style.pointerEvents = "none";
    im.style.opacity = 0.5
    im.src = "images/" + b + ".png"
    im.alt = bList[b].id
}
//Styling elements in "more" page
for(var i =0;i<D.children.length;i++){
    var el = D.children[i]
    el.style.position = "relative"
    el.style.top = "10px"
    el.style.zIndex = -2
    el.style.visibility = "hidden"
    el.style.left = "40px"
    el.style.color = "black"
}
//Keyboard keys that are mapped to buttons
ButKeys = {
    "s":"save",
    "d":"Del",
    "c":"clear",
    "n":"Next",
    "l":"Last",
    "d":"draw",
    "f":"fill",
    "e":"Eraser",
    "ArrowLeft":"undo",
    "ArrowRight":"redo",
    "R":"run",
    "C":"code",
    "+":"zIn",
    "-":"zOut",
}
//Keyboard keys that are mapped to functions
FunKeys = {
    "Escape":esc,
    "S":save_locally,
    "L":load_local,
    "D":delete_local,
    "m":more,
    "p":pdf,
    ".":function(){lw*=1.2;Remember()},
    ",":function(){lw*=0.8;Remember()},
}
window.onresize=resize
window.onpointermove=function(e){
    getPos(e);
}
In.onchange = Import
//Initializing 
disableButton("undo")
disableButton("redo")
resize()
I.value = "full();\nfingerDrawing = false;\nmore();\nOnion=true"
bList["draw"].click()
//Keydown events
document.addEventListener("keydown",function(e){
    if(bList["code"].style.background==ac){return;}
    if(FunKeys[e.key]){FunKeys[e.key]()}
    if(e.key=="Tab"){e.preventDefault()}
    if(bList[ButKeys[e.key]]){bList[ButKeys[e.key]].click()}
    e.preventDefault()
})
I.onkeydown = function(e){if(e.key=="Tab"){
    e.preventDefault()
    var x = I.value
    curPos = I.selectionStart
    I.value = x.slice(0, curPos) + "\t" + x.slice(curPos);
}}

