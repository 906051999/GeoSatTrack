'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import Earth from './Earth'
import Satellites from './Satellites'
import SatellitesStatus from './SatellitesStatus'
import LocationStatus from './LocationStatus'
import { FaLock, FaLockOpen } from 'react-icons/fa'

function RotationWrapper({ children, rotation, axialTilt }) {
  const groupRef = useRef()

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y = rotation
      groupRef.current.rotation.x = axialTilt * (Math.PI / 180)
    }
  })

  return <group ref={groupRef}>{children}</group>
}

function CameraController({ devicePosition }) {
  const { camera, scene } = useThree()
  
  useEffect(() => {
    if (devicePosition) {
      const { latitude, longitude } = devicePosition
      const phi = (90 - latitude) * (Math.PI / 180)
      const theta = (longitude + 180) * (Math.PI / 180)
      
      // 计算定位点在地球表面的位置
      const x = -Math.sin(phi) * Math.cos(theta)
      const y = Math.cos(phi)
      const z = Math.sin(phi) * Math.sin(theta)
      
      // 创建一个表示定位点的向量
      const locationVector = new THREE.Vector3(x, y, z)
      
      // 计算从地球中心到定位点的方向向量
      const direction = locationVector.clone().normalize()
      
      // 设置相机位置，使其在定位点外部一定距离
      const distance = 5 // 调整这个值来改变相机距离地球表面的远近
      camera.position.copy(direction.multiplyScalar(1 + distance))
      
      // 让相机看向定位点
      camera.lookAt(locationVector)
      
      // 更新 OrbitControls
      if (camera.userData.controls) {
        camera.userData.controls.target.copy(locationVector)
        camera.userData.controls.update()
      }
    }
  }, [devicePosition, camera, scene])

  return null
}

export default function Container() {
  const [satelliteData, setSatelliteData] = useState([])
  const [devicePosition, setDevicePosition] = useState(null)
  const [earthRotation, setEarthRotation] = useState(0)
  const earthRef = useRef()
  const axialTilt = 23.5 // 地球轴倾斜角度
  const [isRotationLocked, setIsRotationLocked] = useState(false)

  const handleSatelliteDataUpdate = useCallback((data) => {
    setSatelliteData(data.satelliteData)
  }, [])

  const updateCameraPosition = useCallback((latitude, longitude) => {
    // 移除这个函数，我们不再需要移动地球
  }, [])

  useEffect(() => {
    if (isRotationLocked) return

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
  }, [isRotationLocked])

  const toggleRotationLock = () => {
    setIsRotationLocked(prev => !prev)
  }

  return (
    <div className="w-full h-screen flex flex-col md:flex-row">
      <div className="w-full md:w-3/4 h-full relative">
        <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <RotationWrapper rotation={earthRotation} axialTilt={axialTilt}>
            <Earth ref={earthRef} devicePosition={devicePosition} />
            <Satellites data={satelliteData} />
          </RotationWrapper>
          <OrbitControls makeDefault />
          <CameraController devicePosition={devicePosition} />
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
          setEarthRotation={setEarthRotation}
        />
      </div>
    </div>
  )
}