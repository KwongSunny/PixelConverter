import React, {useState, useEffect, useRef} from 'react';
import {usePalette, PaletteColors} from 'react-palette';
// import { saveAs } from 'file-saver';
import './App.modules.css';
import hexRgb from 'hex-rgb';

function App() {
  const [imageUrl, setImageUrl] = useState('');
  const [colorCount, setColorCount] = useState(8);
  const [majorColors, setMajorColors] = useState<PaletteColors | null>(null);
  const [scaleVisual, setScaleVisual] = useState(0);
  const [scale, setScale] = useState(0);
  const [isRendering, setIsRendering] = useState(false)
  const [duration, setDuration] = useState(0);
  const [isFastRender, setFastRender] = useState(false);
  const [isUsingPalette, setUsingPalette] = useState(false);

  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sourceCanvasRef = useRef<HTMLCanvasElement>(null);
  
  const palette = usePalette(imageUrl);

  const fileInputHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    if(e.target.files)
      setImageUrl(URL.createObjectURL(e.target.files[0]))
  }

  const colorCountHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setColorCount(parseInt(e.target.value));
  }

  const downscaleHandler = (e: React.MouseEvent<HTMLInputElement>) => {
    if(parseInt(e.currentTarget.value) === 0) resetCanvas();
    else if(scale !== parseInt(e.currentTarget.value)){
      setIsRendering(true);
      setScale(parseInt(e.currentTarget.value));
    }
  }

  const resetCanvas = () => {
    if(canvasRef.current){
      const image = new Image();
      image.src = imageUrl;

      const ctx = canvasRef.current.getContext('2d');
      if(ctx){
        ctx.clearRect(0, 0, 1000, 1000);
        ctx.drawImage(image, 0, 0, canvasRef.current.width , canvasRef.current.height);
      }
    }
  }

  const rateColorDiff = (a:{red:number, green:number, blue:number}, b:{red:number, green:number, blue:number, alpha?:number}) => {
    let total = 0;
    total += Math.abs(a.red - b.red);
    total += Math.abs(a.green - b.green);
    total += Math.abs(a.blue -  b.blue);
    return total;
  }

  useEffect(() => {
    const image = new Image();
    image.src = imageUrl;
    image.onload = () => {
      
      //SET CANVAS SIZE
      if(canvasRef.current && sourceCanvasRef.current && canvasContainerRef.current){
        canvasRef.current.width = canvasContainerRef.current.offsetWidth;
        canvasRef.current.height = image.height * (canvasContainerRef.current.offsetWidth/image.width);
        sourceCanvasRef.current.width = canvasContainerRef.current.offsetWidth;
        sourceCanvasRef.current.height = image.height * (canvasContainerRef.current.offsetWidth/image.width);

        const ctx = canvasRef.current.getContext('2d');
        if(ctx){
          ctx.clearRect(0, 0, 1000, 1000);
          ctx.drawImage(image, 0, 0, canvasRef.current.width , canvasRef.current.height);
        }
        const srcCtx = sourceCanvasRef.current.getContext('2d');
        if(srcCtx){
          srcCtx.clearRect(0, 0, 1000, 1000);
          srcCtx.drawImage(image, 0, 0, sourceCanvasRef.current.width,  sourceCanvasRef.current.height)
        }
      }
    };
    setScale(0);
  }, [imageUrl])

  //downscale the image UNOPTIMIZED
  useEffect(() => {
    const image = new Image();
    image.src = imageUrl;

    if(sourceCanvasRef.current && canvasRef.current){
      const srcCtx = sourceCanvasRef.current.getContext('2d');
      const ctx = canvasRef.current.getContext('2d');
    
      if(scale !== 0){
       
        if(ctx)
          ctx.fillStyle = 'rgb(255,0,0)';

        const start = new Date().getTime();

        for(let y = 0; y < sourceCanvasRef.current.height/scale; y++){
          for(let x = 0; x < sourceCanvasRef.current.width/scale; x++){
            if(ctx && srcCtx){
              if(isFastRender){
                let r = 0;
                let g = 0;
                let b = 0;
                let a = 0;
                const imageData = srcCtx.getImageData(x*scale, y*scale, scale, scale).data;
                for(let i = 0; i < imageData.length; i += 4){
                  r += imageData[i];
                  g += imageData[i+1];
                  b += imageData[i+2];
                  a += imageData[i+3];
                }
  
                r /= imageData.length/4;
                g /= imageData.length/4;
                b /= imageData.length/4;
                a /= imageData.length/4;

                ctx.fillStyle = `rgb(${r}, ${g}, ${b})`

                if(isUsingPalette){
                  let minimumDiff = 765;
                  for(const property in majorColors){
                    const rgba = hexRgb(`${majorColors[property]}`);
                    const diffScore = rateColorDiff({red: r, green: g, blue: b},{red: rgba.red, green: rgba.green, blue: rgba.blue})

                    if(diffScore < minimumDiff){
                      minimumDiff = diffScore;
                      ctx.fillStyle = `${majorColors[property]}`
                    }
                  }
                }
                ctx.fillRect(x*scale, y*scale, scale, scale)
  
                if(sourceCanvasRef.current){
                  if(x === (Math.trunc(sourceCanvasRef.current.width/scale)-1) && y === (Math.trunc(sourceCanvasRef.current.height/scale)-1)){
                    setIsRendering(false); 
                  }
                }
              }
              else{
                setTimeout(() => {
                  let r = 0;
                  let g = 0;
                  let b = 0;
                  let a = 0;
                  const imageData = srcCtx.getImageData(x*scale, y*scale, scale, scale).data;
                  for(let i = 0; i < imageData.length; i += 4){
                    r += imageData[i];
                    g += imageData[i+1];
                    b += imageData[i+2];
                    a += imageData[i+3];
                  }
  
                  r /= imageData.length/4;
                  g /= imageData.length/4;
                  b /= imageData.length/4;
                  a /= imageData.length/4;
  
                  ctx.fillStyle = `rgb(${r}, ${g}, ${b})`

                  if(isUsingPalette){
                    let minimumDiff = 765;
                    for(const property in majorColors){
                      const rgba = hexRgb(`${majorColors[property]}`);
                      const diffScore = rateColorDiff({red: r, green: g, blue: b},{red: rgba.red, green: rgba.green, blue: rgba.blue})
  
                      if(diffScore < minimumDiff){
                        minimumDiff = diffScore;
                        ctx.fillStyle = `${majorColors[property]}`
                      }
                    }
                  }
                  ctx.fillRect(x*scale, y*scale, scale, scale)
  
                  if(sourceCanvasRef.current){
                    if(x === (Math.trunc(sourceCanvasRef.current.width/scale)-1) && y === (Math.trunc(sourceCanvasRef.current.height/scale)-1)){
                      setIsRendering(false); 
                    }
                  }
                })
              }
            }
          }
        }

        const end = new Date().getTime();
        setDuration(end - start);
        
      }
    }


  }, [scale])

  useEffect(() => {
    setMajorColors(palette.data)
  },[palette])

  return (
    <div className="App">
      <input type='file' onChange = {fileInputHandler}/><br />
      Color Count<input type = 'range' min = {2} max = {256} defaultValue={colorCount} onChange={colorCountHandler} disabled = {isRendering && imageUrl !== undefined}/>{colorCount}<br />
      Downscale Amount<input type = 'range' min = {0} max = {10} step={1} defaultValue={scaleVisual} onChange = {(e) => {setScaleVisual(parseInt(e.target.value))}} onMouseUp={downscaleHandler} disabled = {isRendering && imageUrl !== undefined}/>{scaleVisual}<br /><br />
      {/* <button onClick={() => {resetCanvas()}}>Reset Canvas</button> */}
      <div ref = {canvasContainerRef} className = 'canvasContainer'>
        <canvas ref = {canvasRef} width = {0} height = {0}>
          Canvas to be edited
        </canvas>
        <canvas ref = {sourceCanvasRef} className='sourceCanvas' width = {0} height = {0}>
          This Canvas will be read-only
        </canvas>
      </div>
      <div>
        <span>{duration}ms</span>
        <button onClick={() => {console.log(canvasRef.current?.toDataURL())}}>Download</button>
      </div>
      <div>
      
          <div style = {{display: 'inline-block', width:'100px', height:'100px', backgroundColor:`${majorColors?.darkMuted}`}}></div>
          <div style = {{display: 'inline-block', width:'100px', height:'100px', backgroundColor:`${majorColors?.darkVibrant}`}}></div> 
          <div style = {{display: 'inline-block', width:'100px', height:'100px', backgroundColor:`${majorColors?.lightMuted}`}}></div> 
          <div style = {{display: 'inline-block', width:'100px', height:'100px', backgroundColor:`${majorColors?.lightVibrant}`}}></div> 
          <div style = {{display: 'inline-block', width:'100px', height:'100px', backgroundColor:`${majorColors?.muted}`}}></div> 
          <div style = {{display: 'inline-block', width:'100px', height:'100px', backgroundColor:`${majorColors?.vibrant}`}}></div>  
      
      </div>
    </div>
  );
}

export default App;
