import React, { useEffect, useRef } from 'react';
import { FloorPlanEngine } from '@archilogic/floor-plan-sdk'

import { placeHub } from './helpers/placeHubs'
import { startupSettings } from './utils/constants'
import './FloorPlan.css'

let hasLoaded = false
let fpe

let prevMaxDist
let prevExtWallOffset

let markers = []

let hubCount
let spaceProCount
let co2MiniCount

const FloorPlan = ({ triggerQuery, model, modelUpdate }) => {
  const container = useRef(null);
  const { token, floorId } = model
  
  console.log('model', model)
  
  function addMarker(fpe, pos, className){
    const el = document.createElement('div')
    el.classList.add(className)
    const marker = fpe.addHtmlMarker({
      pos: pos,
      el
    })
    return marker
  }
  function removeMarker(){
    if (markers.length !== 0){
      markers.forEach(marker => marker.remove())
      markers = [];
    }
  }

  function getSensors(fpe){
    const spaces = fpe.resources.spaces
    const selectedSpaces = spaces.filter(space => {
      return space.program !== 'void' && space.program !== 'circulate' && space.program !== 'care' && space.usage !== 'undefined'
    })
    let miniCount = 0
    let proCount = 0
    selectedSpaces.forEach(space => {
      if(space.area < (100 / 10.764)){
        const marker = addMarker(fpe, [space.center[0], space.center[1]], 'co2-marker')
        markers.push(marker)
        miniCount += 1
      } else {
        const marker = addMarker(fpe, [space.center[0], space.center[1]], 'air-marker')
        markers.push(marker)
        proCount += 1
      }
    })
    spaceProCount = proCount
    co2MiniCount = miniCount
  }
  function getHubs(fpe, maxDist, extWallOffset){
    const maxHubDistanceInFt = maxDist !== 0 ? maxDist : 70
    const wallOffsetInFt = extWallOffset !== 0 ? extWallOffset : 3

    const hubs = placeHub(fpe, maxHubDistanceInFt, wallOffsetInFt)
    hubCount = hubs.length
    hubs.forEach(hub => {
      const marker = addMarker(fpe, hub.point, 'hub-marker')
      markers.push(marker)
    })
    
    prevMaxDist = maxHubDistanceInFt
    prevExtWallOffset = wallOffsetInFt
  }
  
  async function initFloorPlan(){
    if(!token || !floorId) return
    fpe = new FloorPlanEngine(container.current, startupSettings)
      await fpe.loadScene(floorId, {publishableToken: token})
      hasLoaded = floorId
      return fpe
  }
  
  useEffect(() => {
    if(fpe && hasLoaded === floorId) return
    if(container.current){
      initFloorPlan()
      .then((fpe) => {
        if(!fpe) return
        getHubs(fpe, model.maxDist, model.extWallOffset)
        getSensors(fpe)
        modelUpdate({hubCount, spaceProCount, co2MiniCount})
      })
    }
  })

  useEffect(() => {
    if(!hasLoaded) return
    if(model.maxDist === prevMaxDist && model.extWallOffset === prevExtWallOffset) return
    removeMarker()
    getHubs(fpe, model.maxDist, model.extWallOffset)
    getSensors(fpe)
    modelUpdate({hubCount, spaceProCount, co2MiniCount})
  })
  
  return(
    <div id="floor-plan" ref={container}></div>
  )
}

export default FloorPlan