// rafce
// import { Row, Col } from 'react-bootstrap'
// import { loginUrl } fro    sm '../js/spotify';

import '../css/login.css';
// import qed from '../images/qed-systems.png'

import { BsSpotify } from "react-icons/bs";
// import { querystring } from 'querystring'


const LOGIN_URI =
  process.env.NODE_ENV !== 'production'
    ? 'http://localhost:8888/login'
    : 'https://weeklymoviescores.herokuapp.com/login';


const Login = () => {
    return (
        <div id="login-content">
            <div className='center'>
                <BsSpotify id='spotify-logo'></BsSpotify>
                <h4 id='spotify-playlist'>Weekly Movie Scores</h4>
                <p id='playlist'>SPOTIFY PLAYLIST</p>
                <p id='description'>A <i><b>Third-Party</b></i> Web App that uses the Spotify API to render the playlist</p>
                <a id='spotify-login-button' className='btn spotify-button' href={LOGIN_URI}>LOG IN <i id='via'>VIA</i> SPOTIFY</a>
            </div>
        </div>
    )
}

export default Login
