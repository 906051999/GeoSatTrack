import { useRef, useEffect } from 'react'
import * as THREE from 'three'

export default function Satellites({ data }) {
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

  return <group ref={groupRef} />
}