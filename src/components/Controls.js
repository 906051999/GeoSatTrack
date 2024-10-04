import { useEffect, useRef } from 'react'
import { useThree, extend } from '@react-three/fiber'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

extend({ OrbitControls })

export default function Controls() {
  const { camera, gl } = useThree()
  const controlsRef = useRef()

  useEffect(() => {
    const controls = controlsRef.current
    controls.minDistance = 3
    controls.maxDistance = 20
    controls.enableDamping = true
    controls.dampingFactor = 0.05
  }, [])

  return <orbitControls ref={controlsRef} args={[camera, gl.domElement]} />
}