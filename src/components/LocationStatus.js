'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'

const STATUS = {
  IDLE: { color: 'bg-gray-500', text: '等待定位' },
  REQUESTING: { color: 'bg-yellow-500', text: '正在请求位置...' },
  SUCCESS: { color: 'bg-green-500', text: '定位成功' },
  ERROR: { color: 'bg-red-500', text: '定位失败' }
}

export default function LocationStatus({ setDevicePosition, setEarthRotation, updateCameraPosition }) {
  const [status, setStatus] = useState('IDLE')
  const [error, setError] = useState(null)
  const [position, setPosition] = useState(null)

  useEffect(() => {
    // 初始化时设置默认位置为北京
    updatePosition({ coords: { latitude: 39.9042, longitude: 116.4074 } })
  }, [])

  const handleLocate = async () => {
    setStatus('REQUESTING')
    try {
      const pos = await getCurrentPosition()
      updatePosition(pos)
    } catch (error) {
      console.warn("GPS定位失败，尝试IP定位:", error)
      try {
        const { latitude, longitude } = await fetch('https://ipapi.co/json/').then(res => res.json())
        updatePosition({ coords: { latitude, longitude } })
      } catch (error) {
        console.error("IP定位也失败:", error)
        setStatus('ERROR')
        setError("无法获取位置信息。请确保已授予位置权限或检查网络连接。")
      }
    }
  }

  const updatePosition = useCallback(({ coords: { latitude, longitude } }) => {
    setPosition({ latitude, longitude })
    setDevicePosition({ latitude, longitude })
    setStatus('SUCCESS')
    setEarthRotation(longitude * Math.PI / 180)
    updateCameraPosition(latitude, longitude)
  }, [setDevicePosition, setEarthRotation, updateCameraPosition])

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 rounded-2xl shadow-lg bg-gradient-to-br from-gray-800 to-gray-900"
    >
      <h2 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">定位状态</h2>
      <div className="space-y-4">
        <StatusDisplay status={status} />
        {error && <ErrorDisplay error={error} />}
        {position && <PositionDisplay position={position} />}
      </div>
      <LocateButton onClick={handleLocate} />
    </motion.div>
  )
}

const StatusDisplay = ({ status }) => (
  <div className="flex justify-between items-center">
    <span className="font-semibold">状态：</span>
    <span className={`px-3 py-1 rounded-full text-sm ${STATUS[status].color}`}>
      {STATUS[status].text}
    </span>
  </div>
)

const ErrorDisplay = ({ error }) => (
  <p className="text-red-500 text-sm">
    <span className="font-semibold">错误：</span>
    {error}
  </p>
)

const PositionDisplay = ({ position }) => (
  <>
    <CoordinateDisplay label="纬度" value={position.latitude} />
    <CoordinateDisplay label="经度" value={position.longitude} />
  </>
)

const CoordinateDisplay = ({ label, value }) => (
  <div className="flex justify-between items-center">
    <span className="font-semibold">{label}：</span>
    <span>{value.toFixed(4)}°</span>
  </div>
)

const LocateButton = ({ onClick }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className="mt-6 w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg text-sm font-semibold"
  >
    定位
  </motion.button>
)

function getCurrentPosition(options = {}) {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("您的浏览器不支持地理定位。"))
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
      ...options
    })
  })
}