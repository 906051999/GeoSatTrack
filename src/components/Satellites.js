import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function Satellites({ data, earthRotation, axialTilt = 23.5 }) {
  const groupRef = useRef()

  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.clear()
      data.forEach(satellite => {
        const geometry = new THREE.SphereGeometry(0.05, 16, 16)
        const material = new THREE.MeshBasicMaterial({ color: 0xffffff })
        const mesh = new THREE.Mesh(geometry, material)
        
        mesh.position.set(satellite.position.x, satellite.position.y, satellite.position.z)
        groupRef.current.add(mesh)
      })
    }
  }, [data])

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y = earthRotation
      groupRef.current.rotation.x = axialTilt * (Math.PI / 180)
    }
  })

  return <group ref={groupRef} />
}