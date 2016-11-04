config = {}
config.distTreshold = 60
config.distMax = 90
config.textInstructions = 'Jala para actualizar'
config.textInstructionsRelease = 'Suelta para actualizar'
config.textInstructionsReloading = 'Actualizando...'
config.resistanceFunction = (t)->
  Math.min 1, t/2.5

body = document.querySelector('#main')
pullStartY = null
pullMoveY = null
dist = distResisted = 0

ptr = document.createElement('div')
ptrInner = document.createElement('div')
ptr.setAttribute 'style', 'box-shadow: inset 0 -3px 5px rgba(0, 0, 0, 0.12); pointer-events: none; font-size: 0.85em; font-weight: bold; position: absolute; top: 0; height: 0; text-align: center; width: 100%; overflow: hidden; display: flex; align-items: flex-end; align-content: stretch;'
ptr.style.top = "#{body.offsetTop-20}px"
ptr.style.backgroundColor = '#eee'

ptrInner.setAttribute 'style', 'padding: 10px; flex-basis: 100%;'

ptrInner.textContent = config.textInstructions
ptr.appendChild ptrInner
body.appendChild ptr

window.addEventListener 'touchstart', (e)->
  pullStartY = e.touches[0].screenY if !window.scrollY
window.addEventListener 'touchmove', (e)->
  if !pullStartY?
    pullStartY = e.touches[0].screenY if !window.scrollY
  else
    pullMoveY = e.touches[0].screenY

  text = config.textInstructions
  dist = pullMoveY - pullStartY if pullStartY? and pullMoveY?

  if dist > 0
    e.preventDefault()
    body.style.marginTop = "#{distResisted}px"
    ptr.style.height = "#{distResisted}px"
    distResisted = config.resistanceFunction(dist/config.distTreshold) * Math.min(config.distMax, dist)
    if distResisted > config.distTreshold
      text = config.textInstructionsRelease

  ptrInner.textContent = text

window.addEventListener 'touchend', (e)->
  if distResisted > config.distTreshold
    ptrInner.textContent = config.textInstructionsReloading
    setTimeout ->
      window.location.reload()
    , 450
    return

  body.style.marginTop = 0
  ptr.style.height = 0
  pullStartY = pullMoveY = null
  dist = distResisted = 0
