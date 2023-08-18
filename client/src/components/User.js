import { Row, Col } from 'react-bootstrap'
import blankprofile from '../images/blank-profile.png'
import '../css/user.css';

const User = ({ user, playlistCount }) => {
    return (
        <div id='user-wrapper'>
            <div id='user-content'>

                <div className='xsmall'>
                    <img id='user-img' src={user !== null ? (user.images.length > 0 ? user.images[1].url : blankprofile) : blankprofile} alt='user-img'></img>
                    <div id='user-details'>
                        <a id='user-name' target='_blank' rel="noreferrer" href={user !== null ? user.external_urls.spotify : '/'}>{user !== null ? user.display_name : ''}</a>
                        <Row id='user-stat-row'>
                            <Col></Col>
                            <Col className="user-stat">
                                <h6>Followers</h6>
                                <h4>{user !== null ? user.followers.total : ''}</h4>
                            </Col>
                            <Col className="user-stat">
                                <h6>Playlists</h6>
                                {/* write script to account for more than 20 playlists */}
                                <h4>{playlistCount !== null ? playlistCount : ''}</h4> 
                            </Col>
                            <Col></Col>
                        </Row>
                    </div>
                </div>

                <div className='large'>
                    <img id='user-img' src={user !== null ? (user.images.length > 0 ? user.images[1].url : blankprofile) : blankprofile} alt='user-img'></img>
                    <a id='user-name' target='_blank' rel="noreferrer" href={user !== null ? user.external_urls.spotify : '/'}>{user !== null ? user.display_name : ''}</a>
                    <Row id='user-stat-row'>
                        <Col className="user-stat">
                            <h6>Followers</h6>
                            <h4>{user !== null ? user.followers.total : ''}</h4>
                        </Col>
                        <Col className="user-stat">
                            <h6>Playlists</h6>
                            {/* write script to account for more than 20 playlists */}
                            <h4>{playlistCount !== null ? playlistCount : ''}</h4> 
                        </Col>
                    </Row>
                </div>
            </div>
        </div>
    )
}

export default User