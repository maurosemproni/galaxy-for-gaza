import { useState } from 'react'
import Galaxy from "./components/Galaxy";
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
     <Galaxy starCount={18457} />
  )
}

export default App
