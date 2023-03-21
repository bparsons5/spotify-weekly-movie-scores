import { useState, useEffect } from 'react'
import { catchErrors } from '../js/utils';
import { getPlaylistById, doesUserFollowPlaylist, followPlaylist, searchSpotify, getPlaylistTracks, clearPlaylist, addTracksToPlaylist, getAlbumTracks } from '../js/spotify';
// import { weekly } from '../js/weekly';
import axios from 'axios';
import '../css/playlist.css';
import { RxDotFilled } from "react-icons/rx";
import { TbClockHour3 } from "react-icons/tb";
import { RiHeartAddLine, RiHeartFill } from "react-icons/ri";
import blank_playlist from '../images/blank_playlist.png'


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

    // if less than an hour
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
    const [searchData, setSearchData] = useState(null);
    const [search, setSearch] = useState(null);
    const weeklyMovieScoresId =  '15a8yM3uV2nouNvpbeAhYl'


    useEffect(() => {
        const fetchData = async () => {
            const weeklyMovieScoresResponse = await getPlaylistById(weeklyMovieScoresId);
            setWeeklyMovieScores(weeklyMovieScoresResponse.data)
    
            console.log(weeklyMovieScoresResponse.data)

            // get list of movies that came out
            // search for each title
            // filter down to that that contain the soundtrackTags
            // add to the weekly movie scores
            const movieTitle = '65'
            const searchResponse = await searchSpotify(`album:${movieTitle}+tag:new&type=album`);
            setSearchData(searchResponse.data.albums);
        };

        catchErrors(fetchData());
    }, []);


    // KEY LOOP FOR GETTING ALL DATA FROM SPOTIFY
    // When searchData updates, check if there are more search to fetch
    // then update the state variable
    useEffect(() => {
        if (!searchData) {
            return;
        }

        // Playlist endpoint only returns 20 search at a time, so we need to
        // make sure we get ALL search by fetching the next set of search
        const fetchMoreData = async () => {
            if (searchData.next) {
                const { data } = await axios.get(searchData.next);
                setSearchData(data.albums);
            }
        };

        // Use functional update to update search state variable
        // to avoid including search as a dependency for this hook
        // and creating an infinite loop
        setSearch(search => ([
            ...search ? search : [],
            ...searchData.items
        ]));

        // Fetch next set of search as needed
        catchErrors(fetchMoreData());

    }, [searchData]);
    

    useEffect(() => {
        if (search !== null && searchData !== null) {
            if (search.length === searchData.total) {
                // console.log(searchData) // hitting 1000 length limit
                // console.log(search.filter(x => x ? x.album_type === 'album' : false))
                
                const soundtrackTags = [
                    'OST',
                    'Score',
                    'Soundtrack',
                ]

                console.log(search)

                // add to playlist
                // let albumId = search.filter(x => soundtrackTags.some(y => x.name.includes(y)))[0].id
                // const add = async (albumId) => {
                //     const albumTracksResponse = await getAlbumTracks(albumId)
                //     addTracksToPlaylist(weeklyMovieScoresId, albumTracksResponse.data.items.map(x => x.uri).join(','))
                // };
                // catchErrors(add(albumId));


                // clear playlist
                // const clear = async () => {
                //     const playlistTracksResponse = await getPlaylistTracks(weeklyMovieScoresId) // max of 100 at a time
                //     const trackList = {
                //         tracks: []
                //     }
                //     playlistTracksResponse.data.items.forEach(x => trackList.tracks.push({ uri: x.track.uri }))
                //     console.log(trackList)
                //     clearPlaylist(weeklyMovieScoresId, trackList)
                // };
                // catchErrors(clear());
            }
        }
    }, [search, searchData]);


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
        <div id='playlist-wrapper'>
            <div id='playlist-content'>
                <div id='playlist-header'>
                    <img id='playlist-img' src={weeklyMovieScores ? (weeklyMovieScores.images.length > 0 ? weeklyMovieScores.images[0].url : blank_playlist) : ''} alt='playlist-img'></img>
                    <div id='playlist-details'>
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
    )
}

export default Playlist