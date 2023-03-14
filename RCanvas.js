can = document.getElementById("C")
Ex = document.getElementById("E")
I = document.getElementById("I")
L = document.getElementById("L")
B = document.getElementById("B")  
T = document.getElementById("T")
rect = can.getBoundingClientRect()
cX = cY = 0
cW = 0.5
cH = 1
tH = 0.8
B.style.top = L.style.top = `${tH*100 + 2}%`
T.style.top = `${tH*100 + 6}%`
T.style.height = `${(1-tH)*100 -8}%`
L.style.left = I.style.left = `${cW*100 + 2}%`
T.style.width = I.style.width = `${(1-cW)*100 -3}%`
I.style.height = `${tH*100}%`
c = can.getContext("2d")
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
    L.innerText = `(${Math.round(x)},${Math.round(y)})`
}
window.onmousemove=update
function resize(){
    cX = window.innerWidth*cW
    cY = window.innerHeight*cH
    c0 = c.getImageData(0,0,cX,cY)
    Ex.width   = can.width  = cX
    Ex.height  = can.height = cY
    c.putImageData(c0,0,0)
}
window.onresize=resize
function draw(){
    c.strokeStyle = 'red'
    c.fillStyle = 'red'
    c.lineWidth = 10
    c.arc(50,50,40,0,7)
    c.stroke()
}
function run(){
    let s = I.value
    eval(s);
    console.log(s)
}
function print(t){
    T.innerText = t
}
B.onclick = run
c.fillRect(100,100,50,50,'black')
resize()

