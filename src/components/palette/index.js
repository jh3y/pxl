import T from 'prop-types'
import React from 'react'
import { createPortal } from 'react-dom'
import styled from 'styled-components'


const PaletteContainer = styled.li`
  border-left-color: ${p => p.color};
`

const Palette = styled.ul`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  max-height: 194px;
  overflow: auto;
`

const ColorSwatch = styled.button`
  height: 44px;
  width: 44px;
  flex: 0 0 44px;
  cursor: pointer;
  background-color: ${p => p.color};
  border: 2px solid ${p => (p.active ? 'white' : p.color)};
  &:hover {
    z-index: 2;
    transform: scale(1.1);
    transition: 0.15s ease 0s;
  }
`
const ControllerPalette = ({ palette, color, onChange, onDelete, parent }) => {
  if (!parent.current || !parent.current.domElement) return null
  return createPortal(
    <PaletteContainer
      className="cr color color-palette"
      style={{ borderLeftColor: color }}>
      <Palette>
        {palette.map(c => (
          <ColorSwatch
            key={c}
            active={color === c}
            color={c}
            onContextMenu={e => {
              onDelete(e, c)
            }}
            onClick={e => onChange(e, c)}
          />
        ))}
      </Palette>
    </PaletteContainer>,
    parent.current.domElement.querySelector('ul')
  )
}
ControllerPalette.propTypes = {
  color: T.string,
  palette: T.arrayOf(T.string),
  onChange: T.func,
  onDelete: T.func,
  parent: T.shape({
    current: T.object
  })
}

export default ControllerPalette