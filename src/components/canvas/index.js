import T from 'prop-types'
import React, { useEffect, useRef } from 'react'
import styled from 'styled-components'

const Container = styled.div`
  position: relative;
  height: ${(p) => p.height}px;
  width: ${(p) => p.width}px;
`
const Grid = styled.div`
  --circles: ${(p) => p.circles};
  display: grid;
  position: absolute;
  grid-template-rows: repeat(${(p) => p.height}, ${(p) => p.size}px);
  grid-template-columns: repeat(${(p) => p.width}, ${(p) => p.size}px);
`
const Canvas = styled.canvas`
  height: ${(p) => p.height}px;
  position: absolute;
  width: ${(p) => p.width}px;
  background: transparent;
`

const Cell = styled.div`
  border-radius: calc(var(--circles, 0) * 1%);
`
const PixelCanvas = ({ color, cells, size, height, width, circles }) => {
  const gridRef = useRef(null)
  const underlayRef = useRef(null)
  const contextRef = useRef(null)
  const canvasRef = useRef(null)
  const erasing = useRef(false)
  const update = (e) => {
    const cell =
      e.clientX && e.clientY
        ? document.elementFromPoint(e.clientX, e.clientY)
        : e.target
    // if (e.x && e.y) cell = document.elementFromPoint(e.x, e.y)
    if (
      e.target.parentNode === gridRef.current &&
      cell &&
      cell.hasAttribute('data-index')
    ) {
      const CELL_INDEX = parseInt(cell.getAttribute('data-index'), 10)
      const X = CELL_INDEX % width
      const Y = Math.floor(CELL_INDEX / width)
      contextRef.current.fillStyle = color
      if (erasing.current || !circles) {
        contextRef.current[erasing.current ? 'clearRect' : 'fillRect'](
          X * size,
          Y * size,
          size,
          size
        )
      } else if (circles) {
        contextRef.current.beginPath()
        contextRef.current.arc(
          X * size + size / 2,
          Y * size + size / 2,
          size / 2,
          0,
          2 * Math.PI
        )
        contextRef.current.fill()
      }
      cells[
        parseInt(cell.getAttribute('data-index'), 10)
      ].color = erasing.current ? null : color
    }
  }
  const end = (e) => {
    gridRef.current.removeEventListener('pointermove', update)
    window.removeEventListener('pointerup', end)
    erasing.current = false
  }

  const start = (e) => {
    if (e.button === 2) {
      e.preventDefault()
      erasing.current = true
    }
    update(e)
    gridRef.current.addEventListener('pointermove', update)
    window.addEventListener('pointerup', end)
  }

  useEffect(() => {
    if (contextRef.current) {
      contextRef.current.fillStyle = color
    }
  }, [color])

  useEffect(() => {
    if (underlayRef.current) {
      const CTX = underlayRef.current.getContext('2d')
      CTX.clearRect(0, 0, width * size, height * size)
      CTX.strokeStyle = 'hsl(0, 0%, 50%)'
      CTX.lineWidth = 2
      for (let l = 1; l < width ; l++) {
        CTX.moveTo(l * size, 0)
        CTX.lineTo(l * size, height * size)
        CTX.stroke()
      }
      for (let l = 1; l < height; l++) {
        CTX.moveTo(0, l * size)
        CTX.lineTo(width * size, l * size)
        CTX.stroke()
      }
    }
  }, [height, width, size])

  useEffect(() => {
    if (canvasRef.current && contextRef.current === null) {
      contextRef.current = canvasRef.current.getContext('2d')
    }
  }, [])

  useEffect(() => {
    // If there's a cell change, need to draw the image onto the canvas.
    if (contextRef.current) {
      contextRef.current.clearRect(0, 0, width * size, height * size)
      for (let c = 0; c < cells.length; c++) {
        if (cells[c].color) {
          const X = c % width
          const Y = Math.floor(c / width)
          contextRef.current.fillStyle = cells[c].color
          if (circles) {
            contextRef.current.beginPath()
            contextRef.current.arc(
              X * size + size / 2,
              Y * size + size / 2,
              size / 2,
              0,
              Math.PI * 2
            )
            contextRef.current.fill()
          } else {
            contextRef.current.fillRect(X * size - 1, Y * size - 1, size, size)
          }
        }
      }
    }
  }, [height, cells, size, width, circles])

  return (
    <Container width={width * size} height={height * size}>
      <Canvas width={width * size} height={height * size} ref={underlayRef} />
      <Canvas width={width * size} height={height * size} ref={canvasRef} />
      <Grid
        onPointerDown={start}
        onContextMenu={(e) => {
          e.preventDefault()
          return false
        }}
        ref={gridRef}
        width={width}
        height={height}
        size={size}
        circles={circles}>
        {cells.map((c, index) => {
          return <Cell key={index} data-index={index} index={index} />
        })}
      </Grid>
    </Container>
  )
}
PixelCanvas.propTypes = {
  color: T.string,
  cells: T.arrayOf(
    T.shape({
      color: T.string,
    })
  ),
  size: T.number,
  circles: T.bool,
  width: T.number,
  height: T.number,
}

export default PixelCanvas
