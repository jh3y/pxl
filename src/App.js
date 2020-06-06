import React, { useCallback, useState, useRef, useEffect } from 'react'
import { GUI } from 'dat.gui'
import styled from 'styled-components'
import About from './components/about'
import Help from './components/help'
import Actions from './components/actions'
import Snapshots from './components/snapshots'
import Palette from './components/palette'
import Canvas from './components/canvas'
import CONFIG from './config'

const STORAGE_KEY = CONFIG.name

const downloadFile = (content, type, name) => {
  const FILE = new Blob([content], { type: type })
  const FILE_URL = URL.createObjectURL(FILE)
  const link = document.createElement('a')
  link.href = FILE_URL
  link.download = name || `${STORAGE_KEY}-creation`
  document.body.appendChild(link)
  link.click()
  URL.revokeObjectURL(FILE_URL)
  link.remove()
}

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  transform: scale(var(--zoom, 1));
  max-height: 100vh;
  & > * + * {
    margin-top: 2rem;
  }
`

const App = () => {
  const [size, setSize] = useState(CONFIG.size)
  const [radius, setRadius] = useState(CONFIG.radius)
  const [width, setWidth] = useState(CONFIG.width)
  const [height, setHeight] = useState(CONFIG.height)
  const [color, setColor] = useState(CONFIG.color)
  const heightRef = useRef(CONFIG.height)
  const widthRef = useRef(CONFIG.width)
  // const [debugging, setDebugging] = useState(CONFIG.debug)
  const [darkMode, setDarkMode] = useState(
    window.localStorage.getItem(STORAGE_KEY) &&
      JSON.parse(window.localStorage.getItem(STORAGE_KEY)).darkMode
      ? JSON.parse(window.localStorage.getItem(STORAGE_KEY)).darkMode
      : CONFIG.darkMode
  )
  // Purely as a placeholder to trigger a re-render
  const [viewing, setViewing] = useState(false)
  const [palette, setPalette] = useState(
    window.localStorage.getItem(STORAGE_KEY) &&
      JSON.parse(window.localStorage.getItem(STORAGE_KEY)).palette
      ? [...JSON.parse(window.localStorage.getItem(STORAGE_KEY)).palette]
      : [CONFIG.color]
  )
  const [shadow, setShadow] = useState('')
  const [loadingSnapshot, setLoadingSnapshot] = useState(false)
  const [snapshots, setSnapshots] = useState(
    window.localStorage.getItem(STORAGE_KEY) &&
      JSON.parse(window.localStorage.getItem(STORAGE_KEY)).snapshots
      ? [...JSON.parse(window.localStorage.getItem(STORAGE_KEY)).snapshots]
      : []
  )
  const colorControllerRef = useRef(null)
  const colorFolderRef = useRef(null)
  const darkModeRef = useRef(darkMode)
  const snapshotFolderRef = useRef(null)
  const actionsFolderRef = useRef(null)
  const settingsFolderRef = useRef(null)
  const helpFolderRef = useRef(null)
  const aboutFolderRef = useRef(null)
  const controllerRef = useRef(null)
  // const [processing, setProcessing] = useState(false)
  const [processingSnapshot, setProcessingSnapshot] = useState(false)
  const [translateX, setTranslateX] = useState(null)
  const [translateY, setTranslateY] = useState(null)
  const snapshotRef = useRef(null)
  const cellRef = useRef([...new Array(height * width).fill().map(() => ({}))])

  const saveToStorage = useCallback(
    (saveObj) => {
      heightRef.current = height
      widthRef.current = width
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          darkMode,
          palette,
          snapshots,
          height,
          width,
          radius,
          size,
          color,
          ...saveObj,
        })
      )
    },
    [darkMode, palette, snapshots, height, width, radius, size, color]
  )

  const deleteSnapshot = (e, created) => {
    e.preventDefault()
    if (window.confirm('Are you sure you want to delete that snapshot?')) {
      const newSnapshots = snapshots.filter(
        (snapshot) => snapshot.created !== created
      )
      setSnapshots(newSnapshots)
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          darkMode,
          snapshots: newSnapshots,
          palette,
        })
      )
    }
  }

  const handleSnapshot = (e, snapshot) => {
    e.preventDefault()
    if (window.confirm('Loading a snapshot will wipe the current canvas')) {
      snapshotRef.current = snapshot
      setLoadingSnapshot(true)
    }
  }

  const deletePaletteColor = (e, color) => {
    e.preventDefault()
    if (
      window.confirm(
        'Are you sure you want to remove that color from the palette?'
      )
    ) {
      const newPalette = palette.filter((c) => c !== color)
      setPalette(newPalette)
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          height,
          width,
          color,

          darkMode,
          snapshots,
          palette: newPalette,
        })
      )
    }
  }

  const onPaletteChange = (e, c) => {
    e.preventDefault()
    CONFIG.color = c
    controllerRef.current.updateDisplay()
    setColor(c)
    saveToStorage()
  }

  const generateShadow = useCallback(() => {
    // Work out translation based on width, height, and size
    // translateX half of the width plus half of the size
    const translateX = width * size * 0.5 + size * 0.5
    const translateY = height * size * 0.5 - size * 0.5
    // generate the box shadow
    // Iterate over the cell reference
    let str = ``
    for (let c = 0; c < cellRef.current.length; c++) {
      const x = (c % width) + 1
      const y = Math.floor(c / width)
      if (cellRef.current[c].color) {
        // Create a box shadow string and append it to the str
        str += `calc(${x * size} * var(--coefficient, 1px)) calc(${
          y * size
        } * var(--coefficient, 1px)) 0 0 ${cellRef.current[c].color},`
      }
    }
    const SHADOW =
      str.trim() === '' ? 'none' : str.substring(0, str.lastIndexOf(','))
    setTranslateX(translateX)
    setTranslateY(translateY)
    setShadow(SHADOW)
    return SHADOW
  }, [height, size, width])

  const onCss = (download) => {
    const shadow = generateShadow()
    const FILE_CONTENT = `.element {
  /* Change coefficient to make responsive */
  --coefficient: 1px;
  height: calc(${size} * var(--coefficient, 1px));
  width: calc(${size} * var(--coefficient, 1px));
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: ${radius ? '50%' : 0};
}
.element:after {
  content: '';
  height: 100%;
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
  transform: translate(calc(-${
    width * size * 0.5 + size * 0.5
  } * var(--coefficient, 1px)), calc(-${
      height * size * 0.5 + size * 0.5
    } * var(--coefficient, 1px)));
  box-shadow: ${shadow};
}
    `
    if (download) {
      downloadFile(FILE_CONTENT, 'text/css', 'box-shadow-pixel-sprite.css')
      alert('CSS file saved!')
    } else {
      // copy CSS to clipboard
      const el = document.createElement('textarea')
      el.value = FILE_CONTENT
      el.height = el.width = 0
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      alert('Image CSS saved to clipboard!')
    }
  }
  const onSvg = () => {
    // Generate an SVG File
    // Create the SVG and then create a blob from outerHTML
    const SVG = document.createElementNS('http://www.w3.org/2000/svg', 'svg')

    // set width and height
    SVG.setAttribute('width', width * size)
    SVG.setAttribute('height', height * size)
    SVG.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
    SVG.setAttribute('viewBox', `0 0 ${width * size} ${height * size}`)
    for (let c = 0; c < cellRef.current.length; c++) {
      const x = c % width
      const y = Math.floor(c / width)
      if (cellRef.current[c].color) {
        const RECT = document.createElementNS(
          'http://www.w3.org/2000/svg',
          'rect'
        )
        RECT.setAttribute('width', size)
        RECT.setAttribute('height', size)
        RECT.setAttribute('rx', radius ? size * 0.5 : 0)
        RECT.setAttribute('fill', cellRef.current[c].color)
        RECT.setAttribute('x', x * size)
        RECT.setAttribute('y', y * size)
        SVG.appendChild(RECT)
      }
    }
    downloadFile(SVG.outerHTML, 'text/svg', 'shadow.svg')
    alert('Image saved in .svg format!')
  }
  const onClear = () => {
    if (cellRef.current.filter(c => c.color).length === 0) return
    if (window.confirm('Are you sure you wish to clear the canvas?')) {
      cellRef.current = [...new Array(height * width).fill().map(() => ({}))]
      setViewing(new Date().getTime())
    }
  }
  const onTrim = () => {
    if (cellRef.current.filter(c => c.color).length === 0) return
    if (
      window.confirm(
        'Are you sure you want to trim the canvas? Maybe snapshot the current canvas in case you want to go back.'
      )
    ) {
      // Work out how many vertical rows are empty before content
      // We know the width so go from 0 to width and check each column at a time
      const TRIM = {
        xStart: undefined,
        xEnd: undefined,
        yStart: undefined,
        yEnd: undefined,
      }
      const setTrimmingPoints = (bound, start, end, posFunc) => {
        for (let d = 0; d < bound - 1; d++) {
          if (TRIM[start]) break
          // Loop through all the cells checking for x === x and no color
          for (let c = 0; c < cellRef.current.length; c++) {
            if (TRIM[start]) break
            const col = posFunc(c)
            if (d === col && cellRef.current[c].color) {
              TRIM[start] = d
              break
            }
          }
        }
        for (let d = bound - 1; d > 0; d--) {
          if (TRIM[end]) break
          // Loop through all the cells checking for x === x and no color
          for (let c = cellRef.current.length; c > 0; c--) {
            if (TRIM[end]) break
            const col = posFunc(c)
            if (d === col && cellRef.current[c].color) {
              TRIM[end] = d + 1
              break
            }
          }
        }
      }
      setTrimmingPoints(width - 1, 'xStart', 'xEnd', (c) => c % width)
      setTrimmingPoints(height - 1, 'yStart', 'yEnd', (c) =>
        Math.floor(c / width)
      )
      const newWidth = TRIM.xEnd - TRIM.xStart
      const newHeight = TRIM.yEnd - TRIM.yStart
      if (
        TRIM.yStart === 1 &&
        TRIM.yEnd === height - 1 &&
        TRIM.xStart === 1 &&
        TRIM.xEnd === width - 1
      )
        return
      // Here you need to work out the new cell ref array based on the starting point and ending point...
      // Iterate over the original cells and create a new cell Ref based on the xStart, yStart
      const newCells = []
      for (let c = 0; c < cellRef.current.length; c++) {
        const x = c % width
        const y = Math.floor(c / width)
        if (
          x < TRIM.xEnd &&
          x >= TRIM.xStart &&
          y < TRIM.yEnd &&
          y >= TRIM.yStart
        ) {
          newCells.push({
            ...(cellRef.current[c].color && {
              color: cellRef.current[c].color,
            }),
          })
        }
      }
      cellRef.current = newCells
      CONFIG.height = newHeight
      CONFIG.width = newWidth
      heightRef.current = newHeight
      widthRef.current = newWidth
      controllerRef.current.updateDisplay()
      setWidth(newWidth)
      setHeight(newHeight)
      saveToStorage()
    }
  }
  const onSnapshot = () => {
    generateShadow()
    setProcessingSnapshot(true)
  }
  const onImage = () => {
    // The process of creating an image is to draw the cells onto an off-page canvas, convert the context
    // to a data URL and save as a png
    const CANVAS = document.createElement('canvas')
    CANVAS.width = width * size
    CANVAS.height = height * size
    const CONTEXT = CANVAS.getContext('2d')
    for (let c = 0; c < cellRef.current.length; c++) {
      if (cellRef.current[c].color) {
        const x = c % width
        const y = Math.floor(c / width)
        CONTEXT.fillStyle = cellRef.current[c].color
        // Instead make this arc and fill
        CONTEXT.fillRect(x * size, y * size, size, size)
      }
    }
    // create the image URL
    const link = document.createElement('a')
    link.href = CANVAS.toDataURL()
    link.download = 'pixel-drawing.png'
    document.body.appendChild(link)
    link.click()
    link.remove()
    alert(
      'Image saved in .png format!'
    )
  }

  const onExport = () => {
    const FILE_CONTENT = window.localStorage.getItem(STORAGE_KEY)
    downloadFile(FILE_CONTENT, 'application/json', `${STORAGE_KEY}-export.json`)
    alert('Export complete!')
  }

  const onImport = () => {
    // Import is a little trickier. Need to read a file and then translate its content into new state variables.
    const CHOOSE = document.createElement('input')
    CHOOSE.type = 'file'
    const importFile = (e) => {
      CHOOSE.remove()
      const READER = new FileReader()
      READER.onload = (e) => {
        // At this point loop over the imports and import any palette colors that don't exist
        // Or any snapshots that don't exist.
        const IMPORT = JSON.parse(e.target.result)
        const { palette: importPalette, snapshots: importSnapshots } = IMPORT
        if (importPalette && importPalette.length) {
          const ADD_ONS = []
          for (const COLOR of importPalette) {
            if (palette.indexOf(COLOR.toLowerCase()) === -1)
              ADD_ONS.push(COLOR.toLowerCase())
          }
          if (ADD_ONS.length > 0) {
            setPalette([...palette, ...ADD_ONS])
          }
        }
        if (importSnapshots && importSnapshots.length) {
          const ADD_ONS = []
          for (const SNAPSHOT of importSnapshots) {
            // Quite lengthy. But make sure there are no snapshots with a cellset matching what's currently available
            if (
              snapshots.filter((s) => s.cells === SNAPSHOT.cells).length === 0
            ) {
              ADD_ONS.push(SNAPSHOT)
            }
          }
          if (ADD_ONS.length > 0) {
            setSnapshots([...snapshots, ...ADD_ONS])
          }
        }
        alert('Snapshots and palette imported!')
      }
      READER.readAsText(e.target.files[0])
    }
    CHOOSE.addEventListener('input', importFile)
    CHOOSE.click()
  }

  useEffect(() => {
    if (loadingSnapshot) {
      const {
        height,
        radius,
        created,
        width,
        size,
        cells,
      } = snapshotRef.current
      cellRef.current = JSON.parse(cells)
      setHeight(height)
      setWidth(width)
      setSize(size)
      setRadius(radius)
      CONFIG.size = size
      CONFIG.width = width
      CONFIG.height = height
      CONFIG.radius = radius
      heightRef.current = height
      widthRef.current = width
      controllerRef.current.updateDisplay()
      setViewing(created)
      setLoadingSnapshot(false)
      alert('Snapshot loaded')
    }
  }, [loadingSnapshot])

  useEffect(() => {
    if (height !== heightRef.current || width !== widthRef.current) {
      saveToStorage()
      heightRef.current = height
      widthRef.current = width
    }
  }, [height, width, saveToStorage])

  useEffect(() => {
    if (controllerRef.current) return
    // Set dark mode up
    document.documentElement.style.setProperty(
      '--darkness',
      darkMode ? 10 : 100
    )
    controllerRef.current = new GUI()
    const CONFIGURATION = controllerRef.current.addFolder('Configuration')
    CONFIGURATION.add(CONFIG, 'height', 2, 100, 1)
      .onFinishChange((value) => {
        if (
          value !== heightRef.current &&
          window.confirm(
            'Are you sure? Making this change will wipe your current canvas.'
          )
        ) {
          cellRef.current = [
            ...new Array(CONFIG.height * CONFIG.width).fill().map(() => ({})),
          ]
          setHeight(value)
          heightRef.current = value
          saveToStorage()
          // setShadow(null)
        }
      })
      .name('Canvas height')
    CONFIGURATION.add(CONFIG, 'width', 2, 100, 1)
      .onFinishChange((value) => {
        if (
          value !== widthRef.current &&
          window.confirm(
            'Are you sure? Making this change will wipe your current canvas.'
          )
        ) {
          cellRef.current = [
            ...new Array(CONFIG.height * CONFIG.width).fill().map(() => ({})),
          ]
          setWidth(value)
          widthRef.current = value
          saveToStorage()
          // setShadow(null)
        }
      })
      .name('Canvas width')
    CONFIGURATION.add(CONFIG, 'size', 0, 20, 1)
      .onFinishChange((size) => {
        setSize(size)
        // Will trigger shadow generation
        // generateShadow()
      })
      .name('Pixel size')
    CONFIGURATION.add(CONFIG, 'radius')
      .onFinishChange((size) => {
        setRadius(size)
      })
      .name('Pixel radius')

    colorFolderRef.current = controllerRef.current.addFolder('Color')
    colorControllerRef.current = colorFolderRef.current
      .addColor(CONFIG, 'color')
      .onFinishChange((color) => {
        setColor(color)
      })
      .name('Color')

    snapshotFolderRef.current = controllerRef.current.addFolder('Snapshots')
    settingsFolderRef.current = controllerRef.current.addFolder('Settings')
    settingsFolderRef.current
      .add(CONFIG, 'darkMode')
      .onChange(setDarkMode)
      .name('Dark mode')
    const updateZoom = (value) => {
      document.documentElement.style.setProperty('--zoom', value)
      // TODO: Should we store the zoom in localStorage
    }
    const ZOOM = settingsFolderRef.current
      .add(CONFIG, 'zoom', 1, 10, 0.1)
      .onChange(updateZoom)
      .name('Zoom')
    // settingsFolderRef.current
    //   .add(CONFIG, 'debug')
    //   .onChange(setDebugging)
    //   .name('Show dev debug')
    // Add actions folder for buttons
    actionsFolderRef.current = controllerRef.current.addFolder('Actions')

    // Try wheel zoom
    const handleZoom = (e) => {
      const STEP = 0.1
      const D = Math.max(-STEP, Math.min(STEP, e.wheelDeltaY || -e.detail))
      CONFIG.zoom = Math.min(10, Math.max(CONFIG.zoom - D, 1))
      ZOOM.updateDisplay()
      updateZoom(CONFIG.zoom)
    }
    document.querySelector('#root').addEventListener('wheel', handleZoom)
    helpFolderRef.current = controllerRef.current.addFolder('Help')
    aboutFolderRef.current = controllerRef.current.addFolder('About')
    // set a state variable to trigger the intial view?
    setViewing(new Date().getTime())
  }, [darkMode, saveToStorage, palette])

  useEffect(() => {
    if (palette.indexOf(color) === -1) {
      colorControllerRef.current.setValue(color)
      if (palette.indexOf(color) === -1) setPalette([...palette, color])
      saveToStorage({
        palette: palette.indexOf(color) === -1 ? [...palette, color] : palette,
      })
    }
  }, [saveToStorage, color, palette])

  useEffect(() => {
    if (darkModeRef.current !== darkMode) {
      setDarkMode(darkMode)
      document.documentElement.style.setProperty(
        '--darkness',
        darkMode ? 10 : 100
      )
      darkModeRef.current = darkMode
      saveToStorage()
    }
  }, [darkMode, saveToStorage])

  useEffect(() => {
    if (processingSnapshot) {
      if (
        snapshots.filter(
          (snap) => snap.cells === JSON.stringify(cellRef.current)
        ).length === 0 &&
        cellRef.current.filter((c) => c.color !== undefined).length !== 0
      ) {
        // Take all the current state, store it in localStorage.
        // Work out a scale. Save it as a snapshot.
        const SNAPSHOT = {
          height,
          width,
          size,
          color,
          radius,
          created: new Date().getTime(),
          cells: JSON.stringify(cellRef.current),
          translateX,
          translateY,
          shadow,
          // Scale it down so it fits in a 44px button
          snapshotScale: 44 / (Math.max(width, height) * size),
        }

        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            palette,
            snapshots: [...snapshots, SNAPSHOT],
          })
        )
        setSnapshots([...snapshots, SNAPSHOT])
        alert('Snapshot saved')
      }
      setProcessingSnapshot(false)
    }
  }, [
    color,
    height,
    palette,
    processingSnapshot,
    shadow,
    size,
    snapshots,
    translateX,
    translateY,
    width,
    radius,
  ])

  useEffect(() => {
    saveToStorage()
  }, [ size, radius, width, height, color, darkMode, saveToStorage])

  return (
    <Container>
      <Canvas
        size={size}
        radius={radius}
        width={width}
        height={height}
        cells={cellRef.current}
        color={color}
        key={viewing}
      />
      <Palette
        color={color}
        palette={palette}
        parent={colorFolderRef}
        onChange={onPaletteChange}
        onDelete={deletePaletteColor}
      />
      <Snapshots
        snapshots={snapshots}
        onChange={handleSnapshot}
        onDelete={deleteSnapshot}
        parent={snapshotFolderRef}
      />
      <Help parent={helpFolderRef} />
      <About parent={aboutFolderRef} />
      <Actions
        onCss={onCss}
        onSvg={onSvg}
        onSnapshot={onSnapshot}
        onImage={onImage}
        onClear={onClear}
        onExport={onExport}
        onImport={onImport}
        onTrim={onTrim}
        parent={actionsFolderRef}
      />
      {/* debugging && (
        <Output
          shadow={shadow}
          width={width}
          height={height}
          size={size}
          translateX={translateX}
          translateY={translateY}
        />
      ) */}
    </Container>
  )
}
export default App
