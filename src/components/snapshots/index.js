import T from 'prop-types'
import React from 'react'
import { createPortal } from 'react-dom'
import styled from 'styled-components'

import { Debug, DebugContainer } from '../debugging'

// Snapshots Component that is injected into Dat.GUI
const Snapshots = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  max-height: 194px;
  overflow: auto;
`
const Snapshot = styled.button`
  background: none;
  height: 44px;
  width: 44px;
  flex: 0 0 44px;
  padding: 0;
  border: 0;
  position: relative;
  appearance: none;
  cursor: pointer;
  outline: transparent;

  &:hover {
    z-index: 2;
    transform: scale(1.1);
    transition: 0.15s ease 0s;
  }

  & > * {
    position: absolute;
    top: 50%;
    left: 50%;
    transform-origin: center center;
    transform: translate(-50%, -50%) scale(${(p) => p.scale});
  }
`

const SnapshotsContainer = styled.li``

const ControllerSnapshots = ({ snapshots, onChange, onDelete, parent }) => {
  if (!parent.current || !parent.current.domElement) return null
  return createPortal(
    <SnapshotsContainer className="cr snapshot-gallery">
      {snapshots.length === 0 && 'No stored snapshots'}
      {snapshots.length > 0 && (
        <Snapshots>
          {snapshots.map((snapshot) => {
            const {
              created,
              width,
              height,
              shadow,
              size,
              translateX,
              translateY,
              snapshotScale,
            } = snapshot
            return (
              <Snapshot
                onContextMenu={(e) => onDelete(e, created)}
                onClick={(e) => {
                  onChange(e, snapshot)
                }}
                scale={snapshotScale}
                key={created}>
                <DebugContainer width={width} height={height} size={size}>
                  <Debug
                    shadow={shadow}
                    width={size}
                    height={size}
                    translateX={translateX}
                    translateY={translateY}
                  />
                </DebugContainer>
              </Snapshot>
            )
          })}
        </Snapshots>
      )}
    </SnapshotsContainer>,
    parent.current.domElement.querySelector('ul')
  )
}

ControllerSnapshots.propTypes = {
  snapshots: T.arrayOf(T.shape({})),
  onChange: T.func,
  onDelete: T.func,
  parent: T.shape({
    current: T.object,
  }),
}

export default ControllerSnapshots
