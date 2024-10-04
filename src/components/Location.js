import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function Location({ position, earthRotation, axialTilt = 23.5 }) {
  const meshRef = useRef()
  const groupRef = useRef()

  useEffect(() => {
    if (meshRef.current && position) {
      const { latitude, longitude } = position
      const phi = (90 - latitude) * (Math.PI / 180)
      const theta = (longitude + 180) * (Math.PI / 180)
      const x = -Math.sin(phi) * Math.cos(theta)
      const y = Math.cos(phi)
      const z = Math.sin(phi) * Math.sin(theta)
      meshRef.current.position.set(x, y, z)
    }
  }, [position])

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y = earthRotation
      groupRef.current.rotation.x = axialTilt * (Math.PI / 180)
    }
  })

  return (
    <group ref={groupRef}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.02, 16, 16]} />
        <meshBasicMaterial color="red" />
      </mesh>
    </group>
  )
}