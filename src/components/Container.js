'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import Earth from './Earth'
import Satellites from './Satellites'
import Location from './Location'
import SatellitesStatus from './SatellitesStatus'
import LocationStatus from './LocationStatus'

export default function Container() {
  const [satelliteData, setSatelliteData] = useState([])
  const [devicePosition, setDevicePosition] = useState(null)
  const [earthRotation, setEarthRotation] = useState(0)
  const earthRef = useRef()
  const axialTilt = 23.5 // 地球轴倾斜角度

  const handleSatelliteDataUpdate = useCallback((data) => {
    setSatelliteData(data.satelliteData)
  }, [])

  const updateCameraPosition = useCallback((latitude, longitude) => {
    if (earthRef.current) {
      const phi = (90 - latitude) * (Math.PI / 180)
      const theta = (longitude + 180) * (Math.PI / 180)
      const radius = 5
      const x = -radius * Math.sin(phi) * Math.cos(theta)
      const y = radius * Math.cos(phi)
      const z = radius * Math.sin(phi) * Math.sin(theta)
      
      earthRef.current.position.set(-x, -y, -z)
    }
  }, [earthRef])

  useEffect(() => {
    const rotationSpeed = 0.0001 // 调整这个值来改变自转速度
    let animationFrameId

    const animate = () => {
      setEarthRotation(prevRotation => (prevRotation + rotationSpeed) % (2 * Math.PI))
      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <div className="w-full h-screen flex flex-col md:flex-row">
      <div className="w-full md:w-3/4 h-full">
        <Canvas camera={{ position: [0, 0, 10], fov: 75 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <Earth rotation={earthRotation} axialTilt={axialTilt} />
          <Satellites data={satelliteData} earthRotation={earthRotation} axialTilt={axialTilt} />
          {devicePosition && (
            <Location 
              position={devicePosition} 
              earthRotation={earthRotation} 
              axialTilt={axialTilt} 
            />
          )}
          <OrbitControls />
        </Canvas>
      </div>
      <div className="w-full md:w-1/4 h-full p-8 space-y-8 overflow-y-auto">
        <SatellitesStatus onDataUpdate={handleSatelliteDataUpdate} />
        <LocationStatus
          setDevicePosition={setDevicePosition}
          setEarthRotation={setEarthRotation}
          updateCameraPosition={updateCameraPosition}
          earthRef={earthRef}
        />
      </div>
    </div>
  )
}