import LandingPage from "./components/Default/LandingPage"
import { useEffect } from "react"
import {Routes , Route} from 'react-router-dom'
import Switcher from "./components/Default/Switcher";
const App = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <div>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Switcher />} />
      </Routes>
    </div>
  )
}

export default App