import axios from 'axios';

/**
 * Follow a Playlist
 * https://developer.spotify.com/documentation/web-api/reference/follow/follow-playlist/
 */
export const getWeeklyMovies = (page, start, end) => {
    // return axios.get(`https://api.themoviedb.org/3/discover/movie?api_key=7aa5455b0e82cdcc85086f3eab92c7e5&language=en-US&region=US&sort_by=popularity.desc&include_adult=false&include_video=false&page=${page}&release_date.gte=${start}&release_date.lte=${end}&with_watch_monetization_types=flatrate`)
    return axios.get(`https://api.themoviedb.org/3/discover/movie?api_key=7aa5455b0e82cdcc85086f3eab92c7e5&language=en-US&region=US&sort_by=release_date.desc&include_adult=false&include_video=false&page=${page}&primary_release_date.gte=${start}&primary_release_date.lte=${end}&with_watch_monetization_types=flatrate`)
};