import { useRef, useEffect, useState } from 'react'

const useCanvas = (picture, savedData, currentSquareProp, updateFunc, isActivePlayer) => {
    let lastX = useRef(null);;
    let lastY = useRef(null);;
    let dragStart = useRef(null);
    let drawStart = useRef(null);
    var svg = document.createElementNS("http://www.w3.org/2000/svg",'svg');
    var xform = svg.createSVGMatrix();
    var pt  = svg.createSVGPoint();
    const [backpic, setBackpic] = useState(null);
    /* eslint-disable-next-line*/
    const [forceDraw, setForceDraw] = useState(0);
    const [currentSquare, _setCurrentSquare] = useState(null);
    const currentSquareRef = useRef(currentSquare);
    const setCurrentSquare = data => {
        currentSquareRef.current = data;
      _setCurrentSquare(data);
    };
    const [isActivePlayerState, _setIsActivePlayerState] = useState(isActivePlayer);
    const isActivePlayerStateRef = useRef(isActivePlayerState);
    const setIsActivePlayerState = data => {
        isActivePlayerStateRef.current = data;
        _setIsActivePlayerState(data);
    };
    const [currentSquareFromProps, setCurrentSquareFromProps] = useState(null);
    const [scalefaktor, setScalefaktor] = useState(1.1);
    const [setupHasRun, setSetupHasRun] = useState(false);
    const canvasRef = useRef(null);
    const setBackground = () => {
        let canvas = canvasRef.current
        let ctx = canvas.getContext('2d')
        let backPicLocal;
        if (backpic === null){
            backPicLocal = new Image();
            backPicLocal.src = picture;
            
        } else {
            backPicLocal = backpic;
        }
        
        //backpic.src = picture;
        let scalefaktorLoc
        if (backPicLocal.width/canvas.width > backPicLocal.height/canvas.height) {
            scalefaktorLoc = canvas.height / backPicLocal.height;
        } else {
            scalefaktorLoc = canvas.height / backPicLocal.height;
        }
        if (scalefaktorLoc > 600){
            scalefaktorLoc = 1.0;
        }
        ctx.scale(scalefaktorLoc, scalefaktorLoc);
        setScalefaktor(scalefaktorLoc);
        lastX.current =canvas.width/2
        lastY.current =canvas.height/2;
        setBackpic(backPicLocal);

    }
    const trackTransforms = () => {
        let ctx = canvasRef.current.getContext('2d');
        ctx.getTransform = function(){ return xform; };

        let savedTransforms = [];
        let save = ctx.save;
        ctx.save = function(){
            savedTransforms.push(xform.translate(0,0));
            return save.call(ctx);
        };
        var restore = ctx.restore;
        ctx.restore = function(){
            xform = savedTransforms.pop();
            return restore.call(ctx);
        };

        var scale = ctx.scale;
        ctx.scale = function(sx,sy){
            xform = xform.scaleNonUniform(sx,sy);
            return scale.call(ctx,sx,sy);
        };
        var rotate = ctx.rotate;
        ctx.rotate = function(radians){
            xform = xform.rotate(radians*180/Math.PI);
            return rotate.call(ctx,radians);
        };
        var translate = ctx.translate;
        ctx.translate = function(dx,dy){
            xform = xform.translate(dx,dy);
            return translate.call(ctx,dx,dy);
        };
        ctx.transformedPoint = function(x,y){
            pt.x=x; pt.y=y;
            return pt.matrixTransform(xform.inverse());
        }

    }
    const redraw  =  () => {
        let canvas = canvasRef.current
        let ctx = canvas.getContext('2d')
        if (typeof ctx != 'undefined'){
            let backPicLocal;
            if (backpic === null){
                backPicLocal = new Image();
                backPicLocal.src = picture;
                
            } else {
                backPicLocal = backpic;
            }
            let ix, iy, scalefaktorLoc;
            if (backPicLocal.width/canvas.width > backPicLocal.height/canvas.height) {
                scalefaktorLoc = canvas.height / backPicLocal.height;
                ix = 0;
                iy = (canvas.height / 2 / scalefaktorLoc) - (backPicLocal.height / 2);
            } else {
                scalefaktorLoc = canvas.height / backPicLocal.height;
                iy =0;
                ix = (canvas.width / 2 / scalefaktorLoc) - (backPicLocal.width / 2);
            }
            var p1 = ctx.transformedPoint(0,0);
            var p2 = ctx.transformedPoint(canvas.width,canvas.height);
            ctx.clearRect(p1.x,p1.y,p2.x-p1.x,p2.y-p1.y);
            ctx.drawImage(backPicLocal,ix,iy);
            ctx.font = "15px Arial";
            if (savedData){
                ctx.beginPath();
                ctx.strokeStyle= "#000000";
                savedData.findings.forEach((finding) => {
                    ctx.rect(finding.square.x, finding.square.y, finding.square.width, finding.square.height);
                    ctx.fillText(finding.id, finding.square.x+2, finding.square.y + 17);
                });
                ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
                ctx.fill();
                ctx.stroke();
            }

            if (currentSquare){
                ctx.beginPath();
                ctx.strokeStyle= "#FF0000";
                ctx.rect(currentSquare.x, currentSquare.y, currentSquare.width, currentSquare.height);
                ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
                ctx.fill();
                ctx.stroke();
            }
        }

    }
    const zoom = (clicks) => {
        let ctx = canvasRef.current.getContext('2d')
        let pt = ctx.transformedPoint(lastX.current,lastY.current);
        ctx.translate(pt.x,pt.y);
        let factor = Math.pow(scalefaktor,clicks);
        ctx.scale(factor,factor);
        ctx.translate(-pt.x,-pt.y);
        setForceDraw(Math.round(Date.now()/20));
    }

    useEffect(() => {
        setIsActivePlayerState(isActivePlayer);
        if (JSON.stringify(currentSquareFromProps) !== JSON.stringify(currentSquareProp)){
            setCurrentSquareFromProps(currentSquareProp);
            setCurrentSquare(currentSquareProp);
        }
        if (!setupHasRun){
            let canvas = canvasRef.current;
            let ctx = canvas.getContext('2d');
            trackTransforms(ctx);
            canvas.addEventListener('contextmenu', function(e) {
                e.preventDefault();
            }, false);
            canvas.addEventListener('scroll', function(e) {
                e.preventDefault();
            }, false);
        
            canvas.addEventListener('mousemove',function(evt){
              let offsetX = 0;
              let offsetY = 0;
              let canvasParent = canvas.offsetParent;
              while (canvasParent) {
              offsetX = canvasParent.offsetLeft + offsetX;
              offsetY = canvasParent.offsetTop + offsetY;
              canvasParent = canvasParent.offsetParent;
              }
              lastX.current = evt.offsetX || (evt.pageX - (canvas.offsetLeft + offsetX));
              lastY.current = evt.offsetY || (evt.pageY - (canvas.offsetTop + offsetY));

              if (dragStart.current){
                let pt = ctx.transformedPoint(lastX.current,lastY.current);
                ctx.translate(pt.x-dragStart.current.x,pt.y-dragStart.current.y);
                setForceDraw(Math.round(Date.now()/20));

              }
              if (drawStart.current){
                let pt = ctx.transformedPoint(lastX.current,lastY.current);
                let square = {}
                square.x = drawStart.current.x
                square.y = drawStart.current.y
                square.width = pt.x-drawStart.current.x
                square.height = pt.y-drawStart.current.y
                setCurrentSquare(square);
              }
              
            },false);
            canvas.addEventListener('mouseup',function(evt){
                if (drawStart.current){
                    updateFunc("updateCurrent", currentSquareRef.current);
                }
                dragStart.current = null;
                drawStart.current = null;
                //setForceDraw(Math.round(Date.now()/20));
            },false);
            canvas.addEventListener('mousedown',function(evt){
                document.body.style.mozUserSelect = document.body.style.webkitUserSelect = document.body.style.userSelect = 'none';
                let offsetX = 0;
                let offsetY = 0;
                let canvasParent = canvas.offsetParent;
                while (canvasParent) {
                    offsetX = canvasParent.offsetLeft + offsetX;
                    offsetY = canvasParent.offsetTop + offsetY;
                    canvasParent = canvasParent.offsetParent;
                }
                lastX.current = evt.offsetX || (evt.pageX - (canvas.offsetLeft + offsetX));
                lastY.current = evt.offsetY || (evt.pageY - (canvas.offsetTop + offsetY));
                if(evt.button === 0 && isActivePlayerStateRef.current){
                    drawStart.current  = ctx.transformedPoint(lastX.current,lastY.current);
                } else if (evt.button === 1) {
                    dragStart.current = ctx.transformedPoint(lastX.current,lastY.current);
                }
            },false);
            const handleScroll = function(e){
                e.preventDefault();
                var delta = e.wheelDelta ? e.wheelDelta/40 : e.detail ? -e.detail : 0;
                if (delta) zoom(delta);
                return false;
            };
            
            canvas.addEventListener('DOMMouseScroll',handleScroll,false);
            canvas.addEventListener('mousewheel',handleScroll,false);
            setBackground()
            setSetupHasRun(true);
        }
        redraw()

    /* eslint-disable-next-line*/
    }, [redraw])
    return canvasRef
}
export default useCanvas