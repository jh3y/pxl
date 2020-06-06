import T from 'prop-types'
import React from 'react'
import pkg from '../../../package.json'
import { createPortal } from 'react-dom'

const About = ({ parent }) => {
  if (!parent.current || !parent.current.domElement) return null
  return createPortal(
    <li
      className="about"
      style={{
        lineHeight: 1.5,
      }}>
      <h2>{`pxl v${pkg.version}`}</h2>
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
      <p>
        Check out the repo on{' '}
        <a
          style={{ fontWeight: 'bold', color: 'white' }}
          href="https://github.com/jh3y/pxl"
          target="_blank"
          rel="noopener noreferrer">
          Github
        </a>.
      </p>
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
