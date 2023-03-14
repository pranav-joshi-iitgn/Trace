can = document.getElementById("C")
rect = can.getBoundingClientRect()
cW = 0.7
cH = 0.7
can.width  = cX = 7000
can.height = cY = 7000
can.style.width = `${cW*100}%`
can.style.height = `${cH*100}%`
c = can.getContext("2d")
c.strokeStyle = 'white'
c.fillStyle = 'white'
lw = 100
c.lineWidth = lw
L = document.getElementById("L")  
x = 0
y = 0 
md = false
function getPos(e){
    if(e.touches!=undefined){e=e.touches[0]}
    x = (cX/cW) * (e.clientX - rect.left) / window.innerWidth
    y = (cY/cH) * (e.clientY - rect.top) / window.innerHeight
}
function update(e){
    getPos(e)
    L.innerText = `(${x},${y})`
    if(md){
        c.lineTo(x,y)
        c.stroke()
    }
}
document.ontouchmove = document.onmousemove = update
document.ontouchstart = document.onmousedown = function(){
    getPos()
    c.moveTo(x,y)
    c.beginPath()
    md=true
}
document.ontouchend = document.onmouseup = function(){md=false}
