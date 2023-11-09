import React from 'react'
import useCanvas from './UseCanvas'
//from: https://medium.com/@pdx.lucasm/canvas-with-react-js-32e133c05258

const Canvas = props => {  

  const { picture, saveddata, currentsquare, updateFunc, isActivePlayer, ...rest } = props
  const canvasRef = useCanvas(picture, saveddata, currentsquare, updateFunc, isActivePlayer)

  return <canvas className="coCanvas" ref={canvasRef} {...rest}/>
}

export default Canvas