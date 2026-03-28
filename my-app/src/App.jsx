import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="text-center">
        <div className="flex justify-center gap-8 mb-8">
          <img src={viteLogo} alt="Vite logo" className="w-24 h-24" />
          <img src={reactLogo} alt="React logo" className="w-24 h-24" />
        </div>
        <h1 className="text-5xl font-bold text-white mb-4">Vite + React + Tailwind</h1>
        <p className="text-xl text-white mb-8">Your app is up and running!</p>
        <button
          onClick={() => setCount(count + 1)}
          className="px-8 py-3 bg-white text-blue-600 font-bold rounded-lg hover:bg-gray-100 transition"
        >
          Count is: {count}
        </button>
      </div>
    </div>
  )
}

export default App
