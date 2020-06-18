import T from 'prop-types'
import React, { Fragment } from 'react'
import { createPortal } from 'react-dom'
import styled from 'styled-components'

const ActionButton = styled.button`
  background: transparent;
  width: 100%;
  height: 100%;
  padding: 0;
  border: 0;
  text-align: left;
  display: block;
  color: #eee;
  outline: transparent;
  font: 11px 'Lucida Grande', sans-serif;
`
const Actions = ({
  parent,
  onCss,
  onCssVar,
  onSvg,
  onSnapshot,
  onImage,
  onClear,
  onExport,
  onImport,
  onTrim,
}) => {
  if (!parent.current || !parent.current.domElement) return null
  return createPortal(
    <Fragment>
      <li
        className="cr"
        style={{ borderLeft: '3px solid hsl(120, 100%, 50%)' }}>
        <ActionButton
          style={{ width: '100%' }}
          onClick={() => onCss(true)}
          className="property-name">
          Save CSS
        </ActionButton>
      </li>
      <li
        className="cr"
        style={{ borderLeft: '3px solid hsl(180, 100%, 50%)' }}>
        <ActionButton
          style={{ width: '100%' }}
          onClick={() => onCss(false)}
          className="property-name">
          Copy CSS
        </ActionButton>
      </li>
      <li
        className="cr"
        style={{ borderLeft: '3px solid hsl(180, 100%, 50%)' }}>
        <ActionButton
          style={{ width: '100%' }}
          onClick={() => onCssVar()}
          className="property-name">
          Copy as CSS variable
        </ActionButton>
      </li>
      <li
        className="cr"
        style={{ borderLeft: '3px solid hsl(120, 100%, 50%)' }}>
        <ActionButton
          style={{ width: '100%' }}
          onClick={onSvg}
          className="property-name">
          Save SVG
        </ActionButton>
      </li>
      <li
        className="cr"
        style={{ borderLeft: '3px solid hsl(120, 100%, 50%)' }}>
        <ActionButton
          style={{ width: '100%' }}
          onClick={onImage}
          className="property-name">
          Save PNG
        </ActionButton>
      </li>
      <li className="cr" style={{ borderLeft: '3px solid hsl(60, 100%, 50%)' }}>
        <ActionButton
          style={{ width: '100%' }}
          onClick={onSnapshot}
          className="property-name">
          Snapshot
        </ActionButton>
      </li>
      <li className="cr" style={{ borderLeft: '3px solid hsl(60, 100%, 50%)' }}>
        <ActionButton
          style={{ width: '100%' }}
          onClick={onExport}
          className="property-name">
          Export
        </ActionButton>
      </li>
      <li className="cr" style={{ borderLeft: '3px solid hsl(60, 100%, 50%)' }}>
        <ActionButton
          style={{ width: '100%' }}
          onClick={onImport}
          className="property-name">
          Import
        </ActionButton>
      </li>
      <li className="cr function">
        <ActionButton
          style={{ width: '100%' }}
          onClick={onTrim}
          className="property-name">
          Trim canvas
        </ActionButton>
      </li>
      <li className="cr function">
        <ActionButton
          style={{ width: '100%' }}
          onClick={onClear}
          className="property-name">
          Clear canvas
        </ActionButton>
      </li>
    </Fragment>,
    parent.current.domElement.querySelector('ul')
  )
}
Actions.propTypes = {
  onClear: T.func,
  onCss: T.func,
  onCssVar: T.func,
  onSvg: T.func,
  onImage: T.func,
  onSnapshot: T.func,
  onExport: T.func,
  onImport: T.func,
  onTrim: T.func,
  parent: T.shape({
    current: T.object
  }),
}

export default Actions