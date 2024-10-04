import Container from '../components/Container'

export default function Home() {
  return (
    <main className="flex min-h-screen bg-gradient-to-b from-gray-900 to-black">
      <div className="container mx-auto px-4 py-8 md:py-16">
        <h1 className="text-4xl md:text-6xl font-bold text-center text-white mb-8">
          卫星定位系统
        </h1>
        <Container />
      </div>
    </main>
  )
}