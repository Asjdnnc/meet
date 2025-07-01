import { useState } from 'react'
import Landing from './pages/Landing'
import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Regitser'
import VideoMeet from './pages/VideoMeet'
import Home from './pages/Home'
import History from './pages/History'
import withAuth from './utils/withAuth'

function App() {

  return (
      <Router>  
        <Routes>
          <Route  path="/" element={<Landing />} />
          <Route  path="/login" element={<Login />} />
          <Route  path="/signup" element={<Register />} />
          <Route  path="/home" element={withAuth(Home)} />
          <Route  path="/history" element={<History />} />
          <Route  path='/:url' element={<VideoMeet/>}/>
        </Routes>
      </Router> 
  )
}

export default App
