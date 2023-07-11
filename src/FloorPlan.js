import React, { useEffect, useRef } from 'react';
import { FloorPlanEngine } from '@archilogic/floor-plan-sdk'

import { startupSettings, apiBaseURL, spaceColors } from './utils/constants'
import './FloorPlan.css'

let hasLoaded = false
let fpe
let spaceData

const FloorPlan = ({ triggerQuery, model, modelUpdate }) => {
  const container = useRef(null);
  const { token, floorId } = model
  
  console.log('model', model)

  function colorCodeSpaces(spaces){
    spaceData.features.forEach(data => {
      if(data.properties.customAttributes.length === 0) return
            
      const match = spaces.find(space => space.id === data.id)
      const zoneType = data.properties.customAttributes.find(customAttribute => customAttribute.apiFieldName === 'zoneType')
    
      if(zoneType.value === 'focus'){
        match.node.setHighlight({
          fill: spaceColors.focus,
          fillOpacity: 1
        })
      }else if(zoneType.value === 'collaboration'){
        match.node.setHighlight({
          fill: spaceColors.collaboration,
          fillOpacity: 1
        })
      }else if(zoneType.value === 'recharge'){
        match.node.setHighlight({
          fill: spaceColors.recharge,
          fillOpacity: 1
        })
      }
    })
  }
  async function initFloorPlan(){
    if(!token || !floorId) return
    fpe = new FloorPlanEngine(container.current, startupSettings)
    await fpe.loadScene(floorId, {publishableToken: token})
    hasLoaded = floorId

    spaceData = await fetch(
      `${apiBaseURL}space?floorId=${floorId}&includeCustomFields=true&includeCustomAttributes=true&pubtoken=${token}`
    ).then((response) => response.json())

    return fpe
  }
  
  useEffect(() => {
    if(fpe && hasLoaded === floorId) return
    if(container.current){
      initFloorPlan()
      .then((fpe) => {
        colorCodeSpaces(fpe.resources.spaces)
      })
    }
  })
  
  return(
    <div id="floor-plan" ref={container}></div>
  )
}

export default FloorPlan