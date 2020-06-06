import T from 'prop-types'
import React from 'react'
import { createPortal } from 'react-dom'
import styled from 'styled-components'

import { Debug, DebugContainer } from '../debugging'

const OutputDrawer = styled.details`
  position: fixed;
  top: 1rem;
  left: 1rem;
  outline: transparent;
  color: hsl(0, 0%, calc((100 - var(--darkness, 90)) * 1%));
`
const OutputTitle = styled.summary`
  outline: transparent;
`

const Output = ({ height, width, size, shadow, translateX, translateY }) => {
  return createPortal(
    <OutputDrawer>
      <OutputTitle>See CSS output (Run copy first)</OutputTitle>
      <DebugContainer width={width} height={height} size={size}>
        <Debug
          shadow={shadow}
          width={size}
          height={size}
          translateX={translateX}
          translateY={translateY}
        />
      </DebugContainer>
    </OutputDrawer>,
    document.body
  )
}

export default Output