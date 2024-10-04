'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'

export default function SatellitesStatus({ onDataUpdate }) {
  const [satellites, setSatellites] = useState([])

  const fetchSatellites = useCallback(() => {
    const newSatellites = Array.from({ length: 4 }, (_, i) => ({
      id: i + 1,
      position: {
        x: (Math.random() - 0.5) * 20,
        y: (Math.random() - 0.5) * 20,
        z: (Math.random() - 0.5) * 20,
      },
    }))
    setSatellites(newSatellites)
    onDataUpdate({ satelliteData: newSatellites })
  }, [onDataUpdate])

  useEffect(() => {
    fetchSatellites()
    const intervalId = setInterval(fetchSatellites, 5000)
    return () => clearInterval(intervalId)
  }, [fetchSatellites])

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 rounded-2xl shadow-lg bg-gradient-to-br from-gray-800 to-gray-900"
    >
      <h2 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">卫星状态</h2>
      <div className="space-y-4">
        {satellites.map((satellite) => (
          <SatelliteDisplay key={satellite.id} satellite={satellite} />
        ))}
      </div>
      <RefreshButton onClick={fetchSatellites} />
    </motion.div>
  )
}

const SatelliteDisplay = ({ satellite }) => (
  <div className="border-b border-gray-700 pb-2">
    <p className="font-semibold text-blue-300">卫星 {satellite.id}</p>
    {Object.entries(satellite.position).map(([axis, value]) => (
      <CoordinateDisplay key={axis} axis={axis} value={value} />
    ))}
  </div>
)

const CoordinateDisplay = ({ axis, value }) => (
  <div className="flex justify-between items-center text-sm">
    <span className="text-gray-400">{axis.toUpperCase()}：</span>
    <span className="text-gray-200">{value.toFixed(2)}</span>
  </div>
)

const RefreshButton = ({ onClick }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className="mt-6 w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg text-sm font-semibold"
  >
    刷新卫星数据
  </motion.button>
)
