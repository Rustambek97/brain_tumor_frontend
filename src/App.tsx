import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import Home from './pages/Home'
import UploadPage from './pages/UploadPage'
function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Home/>}></Route>
          <Route path='/upload' element={<UploadPage/>}></Route>
        </Routes>
      </BrowserRouter>
    </>
  )
}
export default App
