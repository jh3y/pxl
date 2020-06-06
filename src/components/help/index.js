import T from 'prop-types'
import React from 'react'
import { createPortal } from 'react-dom'
import styled from 'styled-components'

const List = styled.ul`
  && {
    padding: 0.5rem 0 0.5rem 1.5rem;
  }

  && li {
    border-bottom: 0;
    height: auto;
    line-height: 1.5;
  }

  && > li + li {
    margin-top: 0.5rem;
  }
`
const Help = ({ parent }) => {
  if (!parent.current || !parent.current.domElement) return null
  return createPortal(
    <List
      className="help-list"
      style={{
        listStyle: 'disc',
        background: '#1a1a1a',
      }}>
      <li>Draw with left mouse button.</li>
      <li>Erase with right mouse button.</li>
      <li>Colors are automatically stored in the palette.</li>
      <li>{`Zoom in with mouse wheel or via "Settings".`}</li>
      <li>{`Save your drawing by using the "Snapshot" action.`}</li>
      <li>Delete a color or snapshot by right clicking it.</li>
      <li>
        Stores current state, snapshots, palette, settings, etc. in localStorage
      </li>
    </List>,
    parent.current.domElement.querySelector('ul')
  )
}

Help.propTypes = {
  parent: T.shape({
    current: T.object,
  }),
}

export default Help
