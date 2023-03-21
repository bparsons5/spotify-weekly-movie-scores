import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom"
import { accessToken, logout } from './js/spotify';
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import Playlists from './components/Playlists'
import './App.css';

// Scroll to top of page when changing routes
// https://reactrouter.com/web/guides/scroll-restoration/scroll-to-top
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  const [token, setToken] = useState(null)

  useEffect(() => {
    setToken(accessToken)
  }, [])

  return (
    <div id='app'>
      {!token ? 
        <Login /> : 
        <Router>
          <ScrollToTop />
          <Routes>
            <Route path="/weekly-scores-playlist" element={
              <h1>weekly</h1>
            }></Route>
            <Route path="/test" element={
              <h1>Test</h1>
            }></Route>
            <Route path="/playlists/:id" element={
              <h1>Specific Playlist</h1>
            }></Route>
            <Route path="/playlists" element={
              <Playlists />
            }></Route>
            <Route path="/" element={
              <Dashboard accessToken={token} logout={logout}/> 
            }></Route>
          </Routes>
        </Router>
      }
    </div>
  );
}

export default App;
