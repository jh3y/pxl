import styled from 'styled-components'

const DebugContainer = styled.div`
  height: ${(p) => p.height * p.size}px;
  width: ${(p) => p.width * p.size}px;
  overflow: hidden;
  position: relative;
`

const Debug = styled.div`
  height: ${(p) => p.height}px;
  width: ${(p) => p.width}px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  &:after {
    content: '';
    height: 100%;
    width: 100%;
    position: absolute;
    top: 0;
    left: 0;
    transform: translate(-${(p) => p.translateX}px, -${(p) => p.translateY}px);
    box-shadow: ${(p) => p.shadow};
  }
`

export { DebugContainer, Debug }
