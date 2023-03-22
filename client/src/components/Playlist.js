import { useState, useEffect } from 'react'
import { catchErrors } from '../js/utils';
import { getPlaylistById, doesUserFollowPlaylist, followPlaylist, searchSpotify, getPlaylistTracks, clearPlaylist, addTracksToPlaylist, getAlbumTracks, getGenres } from '../js/spotify';
import { getWeeklyMovies } from '../js/weekly'
import axios from 'axios';
import '../css/playlist.css';
import { RxDotFilled } from "react-icons/rx";
import { TbClockHour3 } from "react-icons/tb";
import { FiInfo } from "react-icons/fi";
import { RiHeartAddLine, RiHeartFill } from "react-icons/ri";
import blank_playlist from '../images/blank_playlist.png'
import Modal from 'react-bootstrap/Modal';
import ListGroup from 'react-bootstrap/ListGroup';


const calculatePlayTimeString = (playTime) => {
    let time = ''
    if (playTime >= 86400000) { // more than a day
        let days = Math.floor(playTime / 86400000)
        let remainder = playTime % 86400000
        let hours = Math.floor(remainder / 3600000)
        time = days + ' days ' + hours + ' hours'
    } else if (playTime >= 3600000) { // more than an hour
        let hours = Math.floor(playTime / 3600000)
        let remainder = playTime % 3600000
        let min = Math.floor(remainder / 60000)
        time = hours + ' hours ' + min + ' min'
    } else {
        let min = Math.floor(playTime / 60000)
        let remainder = playTime % 60000
        let sec = Math.floor(remainder / 1000)
        time = min + ' min ' + sec + ' sec'
    }
    return time
}


const calculatePlayTimeStamp = (playTime) => {
    let time = ''
    if (playTime >= 3600000) { // more than an hour
        let hours = Math.floor(playTime / 3600000)
        let remainder = playTime % 3600000
        let min = Math.floor(remainder / 60000)
        remainder = playTime % 60000
        let sec = Math.floor(remainder / 1000)
        time = hours + ':' + min + ':' + sec
    } else {
        let min = Math.floor(playTime / 60000)
        let remainder = playTime % 60000
        let sec = Math.floor(remainder / 1000)
        time = min + ':' + sec
    }
    return time
}


const calculateDateAdded = (date) => {
    let date_returned = '1 minute ago'
    let inputDate = new Date(date)
    let now = new Date();

    let difference = (now.getTime() - inputDate.getTime()) / 1000

    if(difference < 60) {
        date_returned = difference + (difference > 1 ?  ' seconds ago' :  ' second ago')
    } else if(difference < 3600) {
        date_returned = Math.floor(difference / 60) + (difference > 60 * 2 ?  ' minutes ago' :  ' minute ago')
    } else if (difference < 86400) {
        date_returned = Math.floor(difference / 3600) + (difference > 3600 * 2 ?  ' hours ago' :  ' hour ago')
    } else {
        let parts = inputDate.toString().split(' ')
        date_returned = parts[1] + ' ' + parts[2] + ', ' + parts[3]
    }

    return date_returned
}


const Playlist = ({ user }) => {
    const [weeklyMovieScores, setWeeklyMovieScores] = useState(null)
    const [clicked, setClicked] = useState(false)
    const [items, setItems] = useState([])
    const [playTimeString, setPlayTimeString] = useState(null)
    const [playlistOwner, setPlaylistOwner] = useState(null)
    
    const [movies, setMovies] = useState(null);
    const [moviesData, setMoviesData] = useState(null);

    const [titleIndex, setTitleIndex] = useState(0);
    const [titles, setTitles] = useState(null);
    const [returnTitles, setReturnTitles] = useState(null);

    const [spotifyIndex, setSpotifyIndex] = useState(0);
    const [spotify, setSpotify] = useState(null);
    const [spotifyData, setSpotifyData] = useState(null);
    const [spotifyAllAlbums, setSpotifyAllAlbums] = useState(null);
    const [spotifyTotal, setSpotifyTotal] = useState(null);
    const [albumsToAdd, setAlbumsToAdd] = useState(null);

    const weeklyMovieScoresId =  '15a8yM3uV2nouNvpbeAhYl'

    const dateEnd = new Date()
    const end =  dateEnd.toISOString().split('T')[0]

    const dateStart = new Date()
    dateStart.setDate(dateStart.getDate() - 7)
    const start =  dateStart.toISOString().split('T')[0]

    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    useEffect(() => {

        const fetchData = async () => {
            const weeklyMovieScoresResponse = await getPlaylistById(weeklyMovieScoresId);
            setWeeklyMovieScores(weeklyMovieScoresResponse.data)

            // https://www.movieinsider.com/movies/last-week
            // $('.daily .row').toArray().map(x => x.children[1].children[0].innerText)

            const movieResponse = await getWeeklyMovies(1, start, end)
            setMoviesData(movieResponse.data)
        };

        catchErrors(fetchData());
    }, []);

    useEffect(() => {
        if (!moviesData) {
            return;
        }

        // Playlist endpoint only returns 20 search at a time, so we need to
        // make sure we get ALL search by fetching the next set of search
        const fetchMoreData = async () => {
            if (moviesData.page < moviesData.total_pages) {
                const { data } = await getWeeklyMovies(moviesData.page + 1, start, end);
                setMoviesData(data);
            }
        };

        // Use functional update to update search state variable
        // to avoid including search as a dependency for this hook
        // and creating an infinite loop
        setMovies(movies => ([
            ...movies ? movies : [],
            ...moviesData.results
        ]));

        // Fetch next set of search as needed
        catchErrors(fetchMoreData());

    }, [moviesData]);
    
    useEffect(() => {
        if (movies !== null && moviesData !== null) {
            if (movies.length === moviesData.total_results) {
                setTitles([...new Set(movies.map(x => x.title).sort())])
                // console.log(movies)
            }
        }
    }, [movies, moviesData]);

    useEffect(() => {
        if (!titles) {
            return;
        }
    
        const fetchData = async (title) => {
            // console.log(title)
            let movieTitleStripped = title.replace(/[^a-zA-Z0-9-_]/g, ' ').trim()

            if (movieTitleStripped !== '') {
                const searchResponse = await searchSpotify(`album:${title.replace(/[^a-zA-Z0-9-_]/g, ' ')}+tag:new&type=album`);

                if (searchResponse.data.albums.items.length > 0) {
                    setReturnTitles(returnTitles => ([
                        ...returnTitles ? returnTitles : [],
                        title
                    ]));

                    setSpotify(spotify => ([
                        ...spotify ? spotify : [],
                        searchResponse.data.albums
                    ]));
                }

            } 
            
            if (titleIndex < titles.length - 1) {
                // setTitleIndex((t) => t + 1) // results in an infinite loop
                const newIndex = await titleIndex + 1 // when updating the trigger variable, wait for it to find the new value. 
                setTitleIndex(newIndex)
            }
        };
        
        catchErrors(fetchData(titles[titleIndex]));

    }, [titles, titleIndex]);

    useEffect(() => {
        if (!spotify) {
            return;
        }

        if (titleIndex === titles.length - 1) {
            if (spotifyIndex === 0) {
                // console.log(returnTitles)
                // console.log(spotify)
            }
            if (spotifyIndex < spotify.length) {
                setSpotifyData(spotify[spotifyIndex])
            }
        }

    }, [spotify, returnTitles, spotifyIndex, titles, titleIndex])

    // KEY LOOP FOR GETTING ALL DATA FROM SPOTIFY
    // When searchData updates, check if there are more search to fetch
    // then update the state variable
    useEffect(() => {
        if (!spotifyData) {
            return;
        }

        // Playlist endpoint only returns 20 search at a time, so we need to
        // make sure we get ALL search by fetching the next set of search
        const fetchMoreData = async () => {
            if (spotifyData.next) {
                const { data } = await axios.get(spotifyData.next);
                setSpotifyData(data.albums);
            } else {
                // setTitleIndex((t) => t + 1) // results in an infinite loop
                const newIndex = await spotifyIndex + 1 // when updating the trigger variable, wait for it to find the new value. 
                setSpotifyIndex(newIndex)
            }
        };

        // Use functional update to update search state variable
        // to avoid including search as a dependency for this hook
        // and creating an infinite loop
        setSpotifyAllAlbums(spotifyAllAlbums => ([
            ...spotifyAllAlbums ? spotifyAllAlbums : [],
            ...spotifyData.items
        ]));

        // Fetch next set of search as needed
        catchErrors(fetchMoreData());

    }, [spotifyData]);
    
    useEffect(() => {
        if (!spotifyAllAlbums) {
            return;
        }
        
        if (spotifyAllAlbums.length === spotifyData.total) {

            const soundtrackTags = [
                ' OST',
                'score',
                'Score',
                'soundtrack',
                'Soundtrack'
            ]
            
            // filter to soundtracks
            let actualAlbums = spotifyAllAlbums.filter((x) => soundtrackTags.some(y => { if (x) { return (x.name.includes(y)) } }));

            setSpotifyTotal(spotifyTotal => ([
                ...spotifyTotal ? spotifyTotal : [],
                actualAlbums
            ]));

            // reset the variable for the next spot to go through
            setSpotifyAllAlbums(null)
        }
    }, [spotifyAllAlbums, spotifyData, returnTitles]);

    useEffect(() => {
        if (!spotifyTotal) {
            return;
        }

        if (spotifyTotal.length === spotify.length) {

            // narrow down to the specific album
            let output = [] 
            for (let i in spotifyTotal) {
                if (spotifyTotal[i].length !== 0) {
                    let albums = spotifyTotal[i].filter(x => x.name.startsWith(returnTitles[i] + ' ('))
                    if (albums.length > 0) {
                        output.push(albums)
                    }
                }
            }
            console.log(output)

            // clear playlist
            const clear = async () => {
                let playlistTracksResponse = await getPlaylistTracks(weeklyMovieScoresId) // max of 100 at a time
                let num = 0
                do
                {   
                    if (num > 0) {
                        playlistTracksResponse = await axios.get(playlistTracksResponse.data.next);
                    } else {
                        num++
                    }
                    // console.log(playlistTracksResponse)

                    const trackList = {
                        tracks: []
                    }
                    playlistTracksResponse.data.items.forEach(x => trackList.tracks.push({ uri: x.track.uri }))
                    // console.log(trackList)

                    clearPlaylist(weeklyMovieScoresId, trackList)
                } while (playlistTracksResponse.data.next !== null);
            };
            // catchErrors(clear());

            // add to playlist
            const add = async (albumId) => {
                const albumTracksResponse = await getAlbumTracks(albumId)
                addTracksToPlaylist(weeklyMovieScoresId, albumTracksResponse.data.items.map(x => x.uri).join(','))
            };
            // catchErrors(add(albumId));

            // ADD THE ALBUMS TO THE PLAYLIST!!!! YAY!!!!

            // ADD THE ALBUMS TO THE PLAYLIST!!!! YAY!!!!
            const updatePlaylist = async () => {
                // if (output.length > 0) {
                //     await catchErrors(clear())
                // }
    
                for (let i in output) {
                    output[i].forEach(x => {
                        catchErrors(add(x.id));
                    })
                }
            };
            // updatePlaylist()


        }

    }, [spotifyTotal, spotify, returnTitles])
            
    useEffect(() => {
        if (weeklyMovieScores !== null && user !== null) {
            // let tableDataHeaders = ['#', 'IMG', 'TITLE', 'ALBUM', 'DURATION']
            setItems(weeklyMovieScores.tracks.items)

            // Playlist endpoint only returns 20 playlists at a time, so we need to
            // make sure we get ALL playlists by fetching the next set of playlists
            const getPlaylistOwner = async () => {
                const { data } = await axios.get(weeklyMovieScores.owner.href);
                setPlaylistOwner(data)
            };

            catchErrors(getPlaylistOwner());

            // see if playlist is already added
            setClicked(doesUserFollowPlaylist(weeklyMovieScores.id, user.id))
        }

    }, [ weeklyMovieScores, user ])

    useEffect(() => {
        if (items.length > 0) {
            let tracks = items.map(x => x.track)

            let playTimeTotal = 0
            for (let i in tracks) {
                let duration = tracks[i].duration_ms
                playTimeTotal = playTimeTotal + duration
            }
            
            setPlayTimeString(calculatePlayTimeString(playTimeTotal))
        }

    }, [items])

    const followWeeklyMovieScores = () => {
        setClicked(true)
        followPlaylist('15a8yM3uV2nouNvpbeAhYl')
    }

    // account for 20+ tracks

    return (
        <>
        <div id='playlist-wrapper'>
            <div id='playlist-content'>
                <div id='playlist-header'>
                    <img id='playlist-img' src={weeklyMovieScores ? (weeklyMovieScores.images.length > 0 ? weeklyMovieScores.images[0].url : blank_playlist) : ''} alt='playlist-img'></img>
                    <div id='playlist-details'>
                        <FiInfo id='playlist-info' onClick={handleShow}></FiInfo>
                        <p>PUBLIC PLAYLIST</p>
                        <a id='playlist-title' target='_blank' rel="noreferrer" href={weeklyMovieScores ? weeklyMovieScores.external_urls.spotify : '#'}>{weeklyMovieScores ? weeklyMovieScores.name : ''}</a>
                        <div id='playlist-meta'>
                            <img src={playlistOwner ? playlistOwner.images[0].url : ''} alt='meta-img'></img>
                            <span id='playlist-owner'>{weeklyMovieScores ? weeklyMovieScores.owner.display_name : ''}</span>
                            <span id='dot'><RxDotFilled></RxDotFilled></span>
                            {weeklyMovieScores ? <span id='followers-total'>{weeklyMovieScores.followers.total > 1 ? weeklyMovieScores.followers.total + ' likes' : weeklyMovieScores.followers.total + ' like' }</span> : '' }
                            <span id='dot'><RxDotFilled></RxDotFilled></span>
                            <span id='track-total'>{weeklyMovieScores ? weeklyMovieScores.tracks.total : ''} songs,</span>
                            <span id='play-time'>{playTimeString}</span>
                        </div>
                    </div>
                </div>


                <div id='playlist-body'>
                    <span id='add-playlist' onClick={() => followWeeklyMovieScores()}>{clicked ? <RiHeartFill id='clicked' className="add-icon"></RiHeartFill> : <RiHeartAddLine id='unclicked' className="add-icon"></RiHeartAddLine>}</span>

                    <div id='playlist-table'>
                        <div id='tracks-header'>
                            <span className='track-number larger'>#</span>
                            <span className='track-title'>Title</span>
                            <span className='track-album'>Album</span>
                            <span className='track-date'>Date Added</span>
                            <span className='track-duration larger'><TbClockHour3></TbClockHour3></span>
                        </div>
                        {items ? items.map((x, index) => {
                            return <div key={index} className="playlist-track">
                                    <span className='track-number'>{index + 1}</span>
                                    <span className='track-title'>
                                        <img className='track-img' src={x.track.album.images[2].url} alt='track-img'></img>
                                        <h6><a target='_blank' rel="noreferrer" href={x.track.external_urls.spotify}>{x.track.name}</a></h6>
                                        <p>{x.track.album.artists.map(y => {
                                            return <a key={y.id} target='_blank' rel="noreferrer" href={y.external_urls.spotify}>{y.name}</a>
                                        })}</p>
                                    </span>
                                    <span className='track-album'><a target='_blank' rel="noreferrer" href={x.track.album.external_urls.spotify}>{x.track.album.name}</a></span>
                                    <span className='track-date'>{calculateDateAdded(x.added_at)}</span>
                                    <span className='track-duration'>{calculatePlayTimeStamp(x.track.duration_ms)}</span>
                                </div>
                        }) : ''}
                    </div>
                </div>
            </div>
        </div>
        <Modal id='info-modal' show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Weekly Movie Scores Info</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <h5>The Weekly Movie Scores web app executes the following steps to add soundtracks to this playlist on a weekly basis as best it can. Enjoy!</h5>
                <ListGroup as="ol" numbered>
                    <ListGroup.Item as="li">Ping the TMDB API to return all movies released within the past week in the US</ListGroup.Item>
                    <ListGroup.Item as="li">Utilize Spotify's API Search Method to search for any albums that each movie title</ListGroup.Item>
                    <ListGroup.Item as="li">As spotify's search returns numerous objects, thes script goes through and filter the results on keywords like <i>'Soundtrack'</i>, <i>'Score'</i>, etc.</ListGroup.Item>
                    <ListGroup.Item as="li">A second layer of filtering is necessary to confirm the album is indeed the movie soundtrack -  this is mainly done by looking for the common structure of <i>'movie title (movie soundtrack deliniation)'</i></ListGroup.Item>
                    <ListGroup.Item as="li">Once again uses the spotify API to then clear the playlist and add the last weeks movie scores</ListGroup.Item>
                </ListGroup>
            </Modal.Body>
        </Modal>
        </>
    )
}

export default Playlist