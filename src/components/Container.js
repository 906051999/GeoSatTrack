'use client'

import { useState, useRef, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import Earth from './Earth'
import SatellitesStatus from './SatellitesStatus'
import LocationStatus from './LocationStatus'
import { FaLock, FaLockOpen } from 'react-icons/fa'

export default function Container() {
  const [satelliteData, setSatelliteData] = useState([])
  const [devicePosition, setDevicePosition] = useState(null)
  const [isRotationLocked, setIsRotationLocked] = useState(false)
  const earthRef = useRef()

  const handleSatelliteDataUpdate = useCallback((data) => {
    setSatelliteData(data.satelliteData)
  }, [])

  const toggleRotationLock = () => {
    setIsRotationLocked(prev => !prev)
  }

  return (
    <div className="w-full h-screen flex flex-col md:flex-row">
      <div className="w-full md:w-3/4 h-full relative">
        <Canvas camera={{ position: [0, 0, 200], fov: 45 }}>
          <Earth ref={earthRef} devicePosition={devicePosition} isRotationLocked={isRotationLocked} />
        </Canvas>
        <button
          onClick={toggleRotationLock}
          className="absolute top-4 right-4 bg-white bg-opacity-20 p-2 rounded-full hover:bg-opacity-30 transition-colors"
        >
          {isRotationLocked ? <FaLock size={20} color="white" /> : <FaLockOpen size={20} color="white" />}
        </button>
      </div>
      <div className="w-full md:w-1/4 h-full p-8 space-y-8 overflow-y-auto">
        <SatellitesStatus onDataUpdate={handleSatelliteDataUpdate} />
        <LocationStatus
          setDevicePosition={setDevicePosition}
        />
      </div>
    </div>
  )
}