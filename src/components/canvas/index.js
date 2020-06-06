import T from 'prop-types'
import React, { useEffect, useRef } from 'react'
import styled from 'styled-components'

// Pixel Canvas Component
const Grid = styled.div`
  --radius: ${p => p.radius};
  display: grid;
  background: hsl(0, 0%, calc(var(--darkness, 100) * 1%));
  grid-template-rows: repeat(${p => p.height}, ${p => p.size}px);
  grid-template-columns: repeat(${p => p.width}, ${p => p.size}px);
`
const Cell = styled.div`
  background: var(--color, transparent);
  border: 1px solid var(--color, hsl(0, 0%, 40%));
  border-radius: calc(var(--radius, 0) * 1%);
`
const PixelCanvas = ({ color, cells, size, height, width, radius }) => {
  const gridRef = useRef(null)
  const erasing = useRef(false)
  const update = e => {
    const cell = e.x && e.y ? document.elementFromPoint(e.x, e.y) : e.target
    // if (e.x && e.y) cell = document.elementFromPoint(e.x, e.y)
    if (
      e.target.parentNode === gridRef.current &&
      cell &&
      cell.hasAttribute('data-index')
    ) {
      cell.style.setProperty('--color', erasing.current ? null : color)
      cells[
        parseInt(cell.getAttribute('data-index'), 10)
      ].color = erasing.current ? null : color
    }
  }
  const end = e => {
    gridRef.current.removeEventListener('pointermove', update)
    window.removeEventListener('pointerup', end)
    erasing.current = false
  }

  const start = e => {
    if (e.button === 2) {
      e.preventDefault()
      erasing.current = true
    }
    update(e)
    gridRef.current.addEventListener('pointermove', update)
    window.addEventListener('pointerup', end)
  }

  useEffect(() => {
    for (const cell of gridRef.current.children) {
      cell.removeAttribute('style')
    }
  }, [height, width])

  useEffect(() => {
    for (let c = 0; c < cells.length; c++) {
      gridRef.current.children[c].removeAttribute('style')
      if (cells[c].color)
        gridRef.current.children[c].style.setProperty('--color', cells[c].color)
    }
  }, [cells])

  return (
    <Grid
      onPointerDown={start}
      onContextMenu={e => {
        e.preventDefault()
        return false
      }}
      ref={gridRef}
      width={width}
      height={height}
      size={size}
      radius={radius}>
      {cells.map((c, index) => {
        const x = index % width
        const y = Math.floor(index / width)
        return (
          <Cell
            key={index}
            data-x={x}
            data-y={y}
            data-index={index}
            index={index}
          />
        )
      })}
    </Grid>
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
  radius: T.number,
  width: T.number,
  height: T.number,
}

export default PixelCanvas