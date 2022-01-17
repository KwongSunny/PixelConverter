import React, {useState, useEffect, useRef} from 'react';
import './App.modules.css';

function App() {
  const [imageUrl, setImageUrl] = useState('');
  const [colorCount, setColorCount] = useState('8');
  const [majorColors, setMajorColors] = useState(null);
  const [scaleVisual, setScaleVisual] = useState(0);
  const [scale, setScale] = useState(0);
  const [dragging, setDragging] = useState(false);

  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sourceCanvasRef = useRef<HTMLCanvasElement>(null);

  const fileInputHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    if(e.target.files)
      setImageUrl(URL.createObjectURL(e.target.files[0]))
  }

  const colorCountHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setColorCount(e.target.value);
  }

  const downscaleHandler = (e: React.MouseEvent<HTMLInputElement>) => {
    setScale(parseInt(e.currentTarget.value));
  }

  const getMajorColors = () => {

    console.log();
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
    }
    getMajorColors();
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

        for(let y = 0; y < sourceCanvasRef.current.height/scale; y++){
          for(let x = 0; x < sourceCanvasRef.current.width/scale; x++){
            if(ctx && srcCtx){
              setTimeout(() => {
                let r = 0;
                let g = 0;
                let b = 0;
                const imageData = srcCtx.getImageData(x*scale, y*scale, scale, scale).data;
                for(let i = 0; i < imageData.length; i += 4){
                  r += imageData[i];
                  g += imageData[i+1];
                  b += imageData[i+2];
                }

                r /= imageData.length/4;
                g /= imageData.length/4;
                b /= imageData.length/4;

                ctx.fillStyle = (`rgb(${r + ',' + g + ',' + b})`)
                ctx.fillRect(x*scale, y*scale, scale, scale)
              })
            }
          }
        } 
      }
    }


  }, [scale])

  return (
    <div className="App">
      <input type='file' onChange = {fileInputHandler}/><br />
      Color Count<input type = 'range' min = {2} max = {256} defaultValue={colorCount} onChange={colorCountHandler}/>{colorCount}<br />
      Downscale Amount<input type = 'range' min = {0} max = {24} step={3} defaultValue={scaleVisual} onChange = {(e) => {setScaleVisual(parseInt(e.target.value))}} onMouseUp={downscaleHandler}/>{scaleVisual}<br />
      <button onClick={() => {
        if(canvasRef.current){
          const image = new Image();
          image.src = imageUrl;

          const ctx = canvasRef.current.getContext('2d');
          if(ctx){
            ctx.clearRect(0, 0, 1000, 1000);
            ctx.drawImage(image, 0, 0, canvasRef.current.width , canvasRef.current.height);
          }

        }
      }}>Reset Canvas</button>
      <div ref = {canvasContainerRef} className = 'canvasContainer'>
        <canvas ref = {canvasRef}>
          Canvas to be edited
        </canvas>
        <canvas ref = {sourceCanvasRef} className='sourceCanvas'>
          This Canvas will be read-only
        </canvas>
      </div>
    </div>
  );
}

export default App;
