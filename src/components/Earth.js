import React, { useRef, useEffect, useMemo } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import ThreeGlobe from 'three-globe'
import { feature } from 'topojson-client'
import worldData from '../data/countries-110m.json'

function Globe({ isRotationLocked, devicePosition }) {
  const globeRef = useRef()
  const { scene } = useThree()

  const markerSvg = useMemo(() => {
    const svg = `
      <svg viewBox="-4 0 36 36">
        <path fill="#FF4500" d="M14,0 C21.732,0 28,5.641 28,12.6 C28,23.963 14,36 14,36 C14,36 0,24.064 0,12.6 C0,5.641 6.268,0 14,0 Z"></path>
        <circle fill="#fff" cx="14" cy="14" r="7"></circle>
      </svg>
    `
    return `data:image/svg+xml;base64,${btoa(svg)}`
  }, [])

  useEffect(() => {
    const globe = new ThreeGlobe()
      // .globeImageUrl('//unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
      // .bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png')
      .showAtmosphere(true)
      .atmosphereColor('#3a228a')
      .atmosphereAltitude(0.25)

    // 添加国家边界
    const countries = feature(worldData, worldData.objects.countries)
    globe.polygonsData(countries.features)
      .polygonAltitude(0.01)
      .polygonCapColor(() => 'rgba(200, 200, 200, 0.3)')
      .polygonSideColor(() => 'rgba(150, 150, 150, 0.3)')
      .polygonStrokeColor(() => '#111')

    // 设置标签和点标记样式
    globe
      .labelLat(d => d.lat)
      .labelLng(d => d.lng)
      .labelText(d => d.text)
      .labelSize(d => d.size)
      .labelDotRadius(d => d.dotRadius)
      .labelColor(() => '#ffffff')
      .labelResolution(3)
      .pointsData([])
      .pointLat('lat')
      .pointLng('lng')
      .pointColor(() => '#ff0000')
      .pointAltitude(0.1)
      .pointRadius(0.05)
      .pointsMerge(true)
      .htmlElementsData([])
      .htmlElement(d => {
        const el = document.createElement('div')
        el.innerHTML = `<img src="${markerSvg}" style="width: 28px; height: 28px; position: absolute; transform: translate(-50%, -100%);">`
        return el
      })

    globeRef.current = globe
    scene.add(globe)

    return () => {
      scene.remove(globe)
    }
  }, [scene, markerSvg])

  useEffect(() => {
    if (globeRef.current && devicePosition) {
      const { latitude, longitude } = devicePosition
      globeRef.current.labelsData([{
        lat: latitude,
        lng: longitude,
        text: '当前位置',
        size: 0.8,
        dotRadius: 0.5
      }])
      globeRef.current.pointsData([{ lat: latitude, lng: longitude }])
      globeRef.current.htmlElementsData([{ lat: latitude, lng: longitude }])
    }
  }, [devicePosition])

  useFrame(({ clock }) => {
    if (globeRef.current && !isRotationLocked) {
      globeRef.current.rotation.y += 0.001
    }
    
    // 添加脉动效果
    if (globeRef.current && globeRef.current.pointsMaterial) {
      globeRef.current.pointsMaterial.size = 0.05 + Math.sin(clock.getElapsedTime() * 2) * 0.02
    }
  })

  return null
}

const Earth = React.forwardRef(({ devicePosition, isRotationLocked }, ref) => {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[1, 1, 1]} intensity={0.6} />
      <Globe isRotationLocked={isRotationLocked} devicePosition={devicePosition} />
      <OrbitControls ref={ref} enableDamping dampingFactor={0.25} enableZoom />
    </>
  )
})

Earth.displayName = 'Earth'

export default Earth