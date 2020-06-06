import T from 'prop-types'
import React from 'react'
import { createPortal } from 'react-dom'

const About = ({ parent }) => {
  if (!parent.current || !parent.current.domElement) return null
  return createPortal(
    <li
    className='about'
      style={{
        lineHeight: 1.5,
      }}>
      <h2>pxl</h2>
      Made by{' '}
      <a
        style={{ fontWeight: 'bold', color: 'white' }}
        href="https://twitter.com/jh3yy"
        target="_blank"
        rel="noopener noreferrer">
        Jhey
      </a>{' '}
      as part of the{' '}
      <a
        style={{ fontWeight: 'bold', color: 'white' }}
        href="https://twitch.tv/jh3yy"
        rel="noopener noreferrer"
        target="_blank">
        "Making awesome things for awesome people"
      </a>{' '}
      stream.
      <p>&copy; 2020</p>
    </li>,
    parent.current.domElement.querySelector('ul')
  )
}
About.propTypes = {
  parent: T.shape({
    current: T.object,
  }),
}

export default About
