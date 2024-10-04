import { useRef, useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'

export default function Location({ position }) {
  const meshRef = useRef()
  const waveRef = useRef()
  const pulseRef = useRef()

  const waveMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        color: { value: new THREE.Color(0x00ffff) },
        time: { value: 0 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 color;
        uniform float time;
        varying vec2 vUv;
        void main() {
          float distance = length(vUv - vec2(0.5));
          float alpha = smoothstep(0.0, 0.5, 1.0 - distance * 2.0);
          alpha *= sin(time * 3.0 - distance * 10.0) * 0.5 + 0.5;
          gl_FragColor = vec4(color, alpha * 0.7);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
    })
  }, [])

  useEffect(() => {
    if (meshRef.current && waveRef.current && pulseRef.current && position) {
      const { latitude, longitude } = position
      const phi = (90 - latitude) * (Math.PI / 180)
      const theta = (longitude + 180) * (Math.PI / 180)
      
      const x = -Math.sin(phi) * Math.cos(theta)
      const y = Math.cos(phi)
      const z = Math.sin(phi) * Math.sin(theta)
      
      const scale = 1
      meshRef.current.position.set(x * scale, y * scale, z * scale)
      waveRef.current.position.set(x * scale, y * scale, z * scale)
      pulseRef.current.position.set(x * scale, y * scale, z * scale)
      waveRef.current.lookAt(0, 0, 0)
      pulseRef.current.lookAt(0, 0, 0)
    }
  }, [position])

  useFrame((state) => {
    if (waveMaterial) {
      waveMaterial.uniforms.time.value = state.clock.getElapsedTime()
    }
    if (pulseRef.current) {
      pulseRef.current.scale.setScalar(1 + Math.sin(state.clock.getElapsedTime() * 2) * 0.1)
    }
  })

  return (
    <group>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.015, 32, 32]} />
        <meshBasicMaterial color="#00ffff" />
      </mesh>
      <mesh ref={waveRef}>
        <planeGeometry args={[0.1, 0.1]} />
        <primitive object={waveMaterial} attach="material" />
      </mesh>
      <mesh ref={pulseRef}>
        <ringGeometry args={[0.02, 0.025, 32]} />
        <meshBasicMaterial color="#00ffff" transparent opacity={0.7} />
      </mesh>
    </group>
  )
}