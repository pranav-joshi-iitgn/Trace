# Trace

Ever wanted a web-app on which, you can
1. Draw, with stylus, with fingers, even with code!
2. Plot, with colors, with annotations, in 3D,
3. Animate your plots, in 2D, and in 3D,
4. write LaTeX, to make a full on presentation,
5. do a slideshow, (just remember to save the slide)
6. and display a pdf, or an image ?

### [Trace](https://pranav-joshi-iitgn.github.io/Trace/) is the answer !

## Examples

Copy and past the code in the area that opens when you press the "code" button ($\boxed{\scriptstyle{ < / > }}$) , then click the "run" button  
 ($\boxed{\large\triangleright}$) .

### Parabola

```jsx
fX = 300
fY = 500
fW = 200
fH = 200
xlim=[-1,1]
ylim=[0,1]
x=[]
y=[]
for(var t=-1;t<1;t+=0.1){
x.push(t)
y.push(t**2)
}
plot({x:x,y:y})
```

### Beta Distribution

```jsx
x =[]
y = []
a = 8
b = 3
for(var i=0;i<=100;i+=1){
x.push(i)
y.push((i)**a * (100-i)**b)
}
data={
x,
y,
width:0.07,
type:"bar"
}
plot(data,[0,100],[0,((a*100)**a * (b*100)**3)/((a+b)**(a+b))],0.5,0.7,0.3,0.2)
```

### Colourful sine

```jsx
clear()
xlim=[0,1]
ylim=[-1.5,1.5]
x = []
y = []
color = []
for(var i=0;i<1;i+=0.001){
x.push(i);
y.push(Math.cos(2*Math.PI*i));
color.push(`rgb(${255*(i)**2},${255*(1-i)**2},${255*(1-2*i)**2})`)
}
data = {
type:"scatter",
x,
y,
color,
}
Frame()
plot(data)
```

### semi-circle

```jsx
fplot([-1,1],false,100,(t)=>(1-t**2)**0.5,0.5,0.5,0.3,0.3)
```

### powers of x

```jsx
lw = 0.5*r
Remember()
for(var a =0;a<30;a++){
fplot([0,1],false,100,(t)=>(t**a),0.5,0.5,0.3,0.3)
}
for(var a =0;a<30;a++){
fplot([0,1],false,100,(t)=>(t**(1/a)),0.5,0.5,0.3,0.3)
}
```

### powers of x animated

```jsx
lw = 0.5*r
Remember()
for(var a =30;a>0;a--){
fplot([0,1],false,100,(t)=>(t**a),0.5,0.5,0.3,0.3)
save()
Next()
}
for(var a =1;a<30;a++){
fplot([0,1],false,100,(t)=>(t**(1/a)),0.5,0.5,0.3,0.3)
save()
Next()
}
show(100)
```

### mesh

```jsx
fW = 500
fH = 500
fX = 300
fY = 300
xlim=[0,1]
ylim=[0,1]
x = []
y = []
z = []
for(var i=0;i<1;i+=0.005){
xval = []
yval = []
zval = []
for(var j=0;j<1;j+=0.005){
xval.push(j)
yval.push(i)
zval.push((3 -(i**2) -(j**2))**0.5)
}
x.push(xval)
y.push(yval)
z.push(zval)
}
data={
x,
y,
z,
}
lw = 0.5
Remember()
clear()
meshPlot(data)
```

### Colourful mesh

```jsx
fW = 500
fH = 500
fX = 300
fY = 300
xlim=[0,1]
ylim=[0,1]
x = []
y = []
z = []
color = []
for(var i=0;i<1;i+=0.005){
xval = []
yval = []
zval = []
for(var j=0;j<1;j+=0.005){
xval.push(j)
yval.push(i)
zval.push((3 -(i**2) -(j**2))**0.5)
}
x.push(xval)
y.push(yval)
z.push(zval)
color.push(`rgb(${255*i},${100*(1-i**5)},${255*(1-2*i**10)})`)
}
data={
x,
y,
z,
color,
}
lw = 0.5
Remember()
clear()
meshPlot(data,true)
```

### Mesh Transformation

```jsx
x = []
y = []
z = []
for(var i=-1;i<1;i+=0.1){
xval = []
yval = []
zval = []
for(var j=-1;j<1;j+=0.1){
xval.push(j)
yval.push(i)
zval.push(0)
}
x.push(xval)
y.push(yval)
z.push(zval)
}
data={
x,
y,
z,
}
M = Matrix([[1,0,0],[0,1/2,-1/2],[0,1/2,1/2]])
Transform(data,M)
clrF()
meshPlot(data,false,[-1,1],[-1,1])
```

```jsx
clrF()
G = grid(50,50)
function f(data,i){
var x = data.x[i]
var y = data.y[i]
var r = 50 + (x-50)**2 + (y-50)**2
data.x[i] = x + 100*(x - 50)/r
data.y[i] = y + 100*(y - 50)/r
}
Transform(G,f)
meshPlot(G)
```

### 3D animation

```jsx
//ellipsoid rotating
x = []
y = []
z = []
for(var i=-1;i<=1;i+=1/2**4){
xval = []
yval = []
zval = []
for(var j=-Math.PI;j<=Math.PI;j+=Math.PI/64){
xval.push((1-i*i)**0.5 * Math.cos(j))
yval.push((1-i*i)**0.5 * Math.sin(j))
zval.push(i/2)
}
x.push(xval)
y.push(yval)
z.push(zval)
}
data={
x,
y,
z,
}
normal = {
x:[[0, 0 ,-1/20 ,0 ,1/20 ,0]],
y:[[0 ,0 ,0 ,0 ,0 ,0]],
z:[[1/2 ,1/2+1/5 ,1/2+1/5 ,1/2+3/10 ,1/2+1/5 ,1/2+1/5]],
}
M = RotM(Math.PI/100,[1,1,1])
Frame()
funcAnim([function(){
Transform(data,M)
Transform(normal,M)
clrF()
meshPlot(data,true,[-1.05,1.05],[-1.05,1.05],-10,0)
c.strokeStyle = "red"
meshPlot(normal,true,[-1.05,1.05],[-1.05,1.05],-10,0)
}],[200],[4000])
```

```jsx
//turning the table
x = []
y = []
z = []
color=[]
for(var i=-1;i<1;i+=0.1){
xval = []
yval = []
zval = []
for(var j=-1;j<1;j+=0.1){
xval.push(j)
yval.push(i)
zval.push(0)
}
x.push(xval)
y.push(yval)
z.push(zval)
color.push(`rgb(${255*(1+i)},${255*(1-i)},${255*i*i})`)
}
data={
x,
y,
z,
color,
}
M = RotM(Math.PI/100,[1,-1,0])
Frame()
funcAnim([function(){
Transform(data,M)
clrF()
meshPlot(data,false,[-1,1],[-1,1],-10)
}],[200],[2000])
```

### Mutation

```python
fX = 500
fY = 500
fW = 100
fH = 100
grid1 = grid()
grid2 = grid()
R = RotM(0.5,[1,1,1])
M = function(data,i){
data.x[i] -= 5
}
Transform(grid2,M)
Transform(grid2,R)
i = 0
funcAnim([function(){
Mut = LinMut(1/(100-i))
Mutate(grid1,grid2,Mut)
clear(c,true)
meshPlot(grid1)
i++
}])
```

### Separation

```jsx
R = RotM(-Math.PI*0.51,[1,0,0])
Rby51 = RotM(-Math.PI*0.01,[1,0,0])
zed = 0
xlim = ylim = [-1,1]
gr = grid()
dts = {x:[[],[]],y:[[],[]],z:[[],[]],type:'scatter',color:['red','blue']}
data = {x:[[],[]],y:[[],[]],z:[[],[]],type:'scatter',color:['red','blue']}
for(var j=0;j<2;j++){
for(var i=0;i<100;i++){
data.x[j].push(j-1 + Math.random())
data.y[j].push(j-1 + Math.random())
data.z[j].push(0)
dts.x[j].push(j-1+ Math.random())
dts.y[j].push(j-1+ Math.random())
dts.z[j].push(0)
}
}
function show(){
clear(c,true)
meshPlot(dts,true,xlim,ylim,-2)
lw = 0.5
Remember()
meshPlot(gr,false,xlim,ylim,-2)
lw = 2
Remember()
}

function sep(){
zed += 0.005
for(var i=0;i<100;i++){
data.z[0][i] = zed
}
for(var i=0;i<100;i++){
data.z[1][i] = -zed
}
Transform(dts,R,data)
show()
}
function rot(){
Transform(dts,Rby51)
Transform(gr,Rby51)
show()
}
funcAnim([rot,sep],[51,100],[2000,2000])
```
