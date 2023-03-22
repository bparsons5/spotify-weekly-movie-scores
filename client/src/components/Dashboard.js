import { useState, useEffect } from 'react'
import { catchErrors } from '../js/utils';
import { getCurrentUser, getUserPlaylists } from '../js/spotify';
import { BsSpotify } from "react-icons/bs";
import User from './User'
import Playlist from './Playlist'
import '../css/dashboard.css';

const Dashboard = ({ accessToken, logout }) => {
  const [user, setUser] = useState(null)
  const [playlistCount, setPlaylistCount] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      const userResponse = await getCurrentUser();
      setUser(userResponse.data)

      const playlistResponse = await getUserPlaylists();
      setPlaylistCount(playlistResponse.data.total)
    }
    
    catchErrors(fetchData())

  }, [])

  return (
    <div id='dashboard'>
      <div id='panel'> 
        <BsSpotify id='panel-spotify-logo'></BsSpotify>
        <div id='panel-spotify-banner'>
          <button id='panel-spotify-log-out' onClick={logout}>LOG OUT</button>
        </div>
        <User user={user} playlistCount={playlistCount}></User>
        <div id='recognition'>
            <span><p id='powered-by'>powered by</p><img id='tmdb' src='https://www.themoviedb.org/assets/2/v4/logos/v2/blue_square_2-d537fb228cf3ded904ef09b136fe3fec72548ebc1fea3fbbd1ad9e36364db38b.svg' alt='tmdb'></img></span>
        </div>
      </div>
      {/* get rid of main */}
      <div id='main'>
        <Playlist user={user}></Playlist>
      </div>
    </div>
  );
};

export default Dashboard;