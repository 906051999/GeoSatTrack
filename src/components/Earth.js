import { useRef, forwardRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'

const Earth = forwardRef(({ rotation, axialTilt = 23.5 }, ref) => {
  const meshRef = useRef()
  const groupRef = useRef()

  const latitudeLines = useMemo(() => {
    const lines = []
    for (let i = -80; i <= 80; i += 20) {
      const geometry = new THREE.BufferGeometry()
      const points = []
      for (let j = 0; j <= 360; j++) {
        const phi = i * (Math.PI / 180)
        const theta = j * (Math.PI / 180)
        const x = Math.cos(theta) * Math.cos(phi)
        const y = Math.sin(phi)
        const z = Math.sin(theta) * Math.cos(phi)
        points.push(new THREE.Vector3(x, y, z))
      }
      geometry.setFromPoints(points)
      lines.push(<line key={`lat-${i}`} geometry={geometry}>
        <lineBasicMaterial color="#00FFFF" opacity={0.3} transparent />
      </line>)
    }
    return lines
  }, [])

  const longitudeLines = useMemo(() => {
    const lines = []
    for (let i = 0; i < 360; i += 20) {
      const geometry = new THREE.BufferGeometry()
      const points = []
      for (let j = -90; j <= 90; j++) {
        const phi = j * (Math.PI / 180)
        const theta = i * (Math.PI / 180)
        const x = Math.cos(theta) * Math.cos(phi)
        const y = Math.sin(phi)
        const z = Math.sin(theta) * Math.cos(phi)
        points.push(new THREE.Vector3(x, y, z))
      }
      geometry.setFromPoints(points)
      lines.push(<line key={`lon-${i}`} geometry={geometry}>
        <lineBasicMaterial color="#00FFFF" opacity={0.3} transparent />
      </line>)
    }
    return lines
  }, [])

  const equator = useMemo(() => {
    const geometry = new THREE.BufferGeometry()
    const points = []
    for (let i = 0; i <= 360; i++) {
      const theta = i * (Math.PI / 180)
      points.push(new THREE.Vector3(Math.cos(theta), 0, Math.sin(theta)))
    }
    geometry.setFromPoints(points)
    return <line geometry={geometry}>
      <lineBasicMaterial color="#FF00FF" linewidth={2} />
    </line>
  }, [])

  const poles = useMemo(() => {
    const northPole = new THREE.Vector3(0, 1.03, 0)
    const southPole = new THREE.Vector3(0, -1.03, 0)
    const geometry = new THREE.BufferGeometry().setFromPoints([northPole, southPole])
    return (
      <>
        <line geometry={geometry}>
          <lineBasicMaterial color="#FFFFFF" linewidth={2} />
        </line>
        <Html position={[0, 1.1, 0]} center>
          <div style={{
            color: '#E0F7FA',
            fontSize: '18px',
            fontWeight: '500',
            whiteSpace: 'nowrap',
            textShadow: '0 0 5px rgba(224, 247, 250, 0.7)',
            letterSpacing: '1px'
          }}>
            N
          </div>
        </Html>
        <Html position={[0, -1.1, 0]} center>
          <div style={{
            color: '#FFF3E0',
            fontSize: '18px',
            fontWeight: '500',
            whiteSpace: 'nowrap',
            textShadow: '0 0 5px rgba(255, 243, 224, 0.7)',
            letterSpacing: '1px'
          }}>
            S
          </div>
        </Html>
      </>
    )
  }, [])

  const timeZones = useMemo(() => {
    const lines = []
    for (let i = 0; i < 24; i++) {
      const geometry = new THREE.BufferGeometry()
      const points = []
      const longitude = i * 15 - 180
      for (let j = -90; j <= 90; j += 5) {
        const phi = j * (Math.PI / 180)
        const theta = longitude * (Math.PI / 180)
        const x = Math.cos(theta) * Math.cos(phi)
        const y = Math.sin(phi)
        const z = Math.sin(theta) * Math.cos(phi)
        points.push(new THREE.Vector3(x, y, z))
      }
      geometry.setFromPoints(points)
      lines.push(<line key={`tz-${i}`} geometry={geometry}>
        <lineBasicMaterial color="#00FF00" opacity={0.2} transparent />
      </line>)
    }
    return lines
  }, [])

  const timeZoneLabels = useMemo(() => {
    const radius = 1.5;
    return Array.from({ length: 24 }, (_, i) => {
      const angle = (i / 24) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      let hour = (i + 12) % 24;
      let label = hour === 0 ? 'UTC' : hour > 12 ? `UTC-${24 - hour}` : `UTC+${hour}`;
      return (
        <Html key={`tz-label-${i}`} position={[x, radius, z]} center>
          <div style={{ 
            color: '#FFFFFF', 
            fontSize: '12px', 
            whiteSpace: 'nowrap', 
            textShadow: '0 0 4px rgba(255, 255, 255, 0.7)',
            fontFamily: 'Arial, sans-serif',
            fontWeight: 'bold',
          }}>
            {label}
          </div>
        </Html>
      );
    });
  }, []);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y = rotation
      groupRef.current.rotation.x = axialTilt * (Math.PI / 180)
    }
  })

  return (
    <group ref={groupRef}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshPhongMaterial
          color="#001133"
          emissive="#001133"
          specular="#0044FF"
          shininess={10}
          opacity={0.9}
          transparent
        />
      </mesh>
      {latitudeLines}
      {longitudeLines}
      {equator}
      {poles}
      {timeZones}
      {timeZoneLabels}
      <line>
        <bufferGeometry attach="geometry" {...new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, -1, 0), new THREE.Vector3(0, 1, 0)])} />
        <lineBasicMaterial attach="material" color="#FF0000" />
      </line>
    </group>
  )
})

Earth.displayName = 'Earth'

export default Earth