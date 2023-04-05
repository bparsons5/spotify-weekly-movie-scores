import { useState, useEffect } from 'react'
import { catchErrors, catchInitialErrors } from '../js/utils';
import { getCurrentUser, getUserPlaylists } from '../js/spotify';
import { BsSpotify } from "react-icons/bs";
import { MdOutlineLink } from "react-icons/md";
import User from './User'
import Playlist from './Playlist'
import { Row, Col } from 'react-bootstrap'
import '../css/dashboard.css';

const Dashboard = ({ accessToken, logout }) => {
  const [user, setUser] = useState(null)
  const [playlistCount, setPlaylistCount] = useState(null)
  // console.log('here')
  // console.log(accessToken)

  useEffect(() => {
    const fetchData = async () => {
      const userResponse = await getCurrentUser();

      if (userResponse.error !== undefined) {
        console.log(userResponse.error)
      }

      if (userResponse === null) {
        console.log('logout')
        logout()
      }

      setUser(userResponse.data)

      const playlistResponse = await getUserPlaylists();
      setPlaylistCount(playlistResponse.data.total)
    }
    
    catchInitialErrors(fetchData(), logout)

  }, [])

  return (
    <Row id='dashboard'>
      <Col id='panel' className='dash-col' xs={12} lg={3}> 
        <a id='spotify-link' target='_blank' rel="noreferrer" href='https://open.spotify.com/'><BsSpotify id='panel-spotify-logo'></BsSpotify></a>
        <div id='panel-spotify-banner'>
          <button id='panel-spotify-log-out' onClick={logout}>LOG OUT</button>
        </div>
        <User user={user} playlistCount={playlistCount}></User>
        <div id='recognition'>
            <div><p id='developed-by'>third-party web app developed by</p><a id='bp-link' target='_blank' rel="noreferrer" href='https://www.rbrettparsons.xyz'>brett parsons<MdOutlineLink id='bp-link-icon'></MdOutlineLink></a></div>
            <div><p id='powered-by'>powered by</p><a id='tmdb' target='_blank' rel="noreferrer" href='https://www.themoviedb.org/'><img id='tmdb-img' src='https://www.themoviedb.org/assets/2/v4/logos/v2/blue_square_2-d537fb228cf3ded904ef09b136fe3fec72548ebc1fea3fbbd1ad9e36364db38b.svg' alt='tmdb'></img></a></div>
        </div>
      </Col>
      <Col id='main' className='dash-col' xs={12} lg={9}>
        <Playlist user={user}></Playlist>
      </Col>
    </Row>
  );
};

export default Dashboard;