import axios from 'axios';

const LOCALSTORAGE_KEYS = {
  accessToken: 'spotify_access_token',
  refreshToken: 'spotify_refresh_token',
  expireTime: 'spotify_token_expire_time',
  timestamp: 'spotify_token_timestamp',
}

const LOCALSTORAGE_VALUES = {
  accessToken: window.localStorage.getItem(LOCALSTORAGE_KEYS.accessToken),
  refreshToken: window.localStorage.getItem(LOCALSTORAGE_KEYS.spotify_refresh_token),
  expireTime: window.localStorage.getItem(LOCALSTORAGE_KEYS.spotify_token_expire_time),
  timestamp: window.localStorage.getItem(LOCALSTORAGE_KEYS.spotify_token_timestamp)
}

/**
 * Checks if the amount of time that has elapsed between the timestamp in localStorage
 * and now is greater than the expiration time of 3600 seconds (1 hour).
 * @returns {boolean} Whether or not the access token in localStorage has expired
 */
const hasTokenExpired = () => {
  const { accessToken, timestamp, expireTime } = LOCALSTORAGE_VALUES;
  if (!accessToken || !timestamp) {
    return false;
  }
  const millisecondsElapsed = Date.now() - Number(timestamp);
  return (millisecondsElapsed / 1000) > Number(expireTime);
};

/**
 * Clear out all localStorage items we've set and reload the page
 * @returns {void}
 */
export const logout = () => {
  // Clear all localStorage items
  console.log('logout')
  for (const property in LOCALSTORAGE_KEYS) {
    window.localStorage.removeItem(LOCALSTORAGE_KEYS[property]);
  }
  // Navigate to homepage
  window.location = window.location.origin;
};

/**
 * Use the refresh token in localStorage to hit the /refresh_token endpoint
 * in our Node app, then update values in localStorage with data from response.
 * @returns {void}
 */
const refreshToken = async () => {
  try {
    // Logout if there's no refresh token stored or we've managed to get into a reload infinite loop
    if (!LOCALSTORAGE_VALUES.refreshToken ||
      LOCALSTORAGE_VALUES.refreshToken === 'undefined' ||
      (Date.now() - Number(LOCALSTORAGE_VALUES.timestamp) / 1000) < 1000
    ) {
      console.error('No refresh token available');
      logout();
    }

    // Use `/refresh_token` endpoint from our Node app
    const { data } = await axios.get(`/refresh_token?refresh_token=${LOCALSTORAGE_VALUES.refreshToken}`);

    // Update localStorage values
    window.localStorage.setItem(LOCALSTORAGE_KEYS.accessToken, data.access_token);
    window.localStorage.setItem(LOCALSTORAGE_KEYS.timestamp, Date.now());

    // Reload the page for localStorage updates to be reflected
    window.location.reload();

  } catch (e) {
    console.error(e);
  }
};

const getAccessToken = () => {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const queryParams = {
    [LOCALSTORAGE_KEYS.accessToken]: urlParams.get('access_token'),
    [LOCALSTORAGE_KEYS.refreshToken]: urlParams.get('refresh_token'),
    [LOCALSTORAGE_KEYS.expireTime]: urlParams.get('expires_in'),
  };
  const hasError = urlParams.get('error');

  // If there's an error OR the token in localStorage has expired, refresh the token
  if (hasError || hasTokenExpired() || LOCALSTORAGE_VALUES.accessToken === 'undefined') {
    refreshToken();
  }

  // If there is a valid access token in localStorage, use that
  if (LOCALSTORAGE_VALUES.accessToken && LOCALSTORAGE_VALUES.accessToken !== 'undefined') {
    return LOCALSTORAGE_VALUES.accessToken;
  }

  // If there is a token in the URL query params, user is logging in for the first time
  if (queryParams[LOCALSTORAGE_KEYS.accessToken]) {
    // Store the query params in localStorage
    for (const property in queryParams) {
      window.localStorage.setItem(property, queryParams[property]);
    }
    // Set timestamp
    window.localStorage.setItem(LOCALSTORAGE_KEYS.timestamp, Date.now());
    // Return access token from query params
    return queryParams[LOCALSTORAGE_KEYS.accessToken];
  }

  // We should never get here!
  return false;
}

export const accessToken = getAccessToken();















// API CALLS ***************************************************************************************

/**
 * Axios global request headers
 * https://github.com/axios/axios#global-axios-defaults
 */
axios.defaults.baseURL = 'https://api.spotify.com/v1';
axios.defaults.headers['Authorization'] = `Bearer ${accessToken}`;
axios.defaults.headers['Content-Type'] = 'application/json';

/**
 * Get Current User's Profile
 * https://developer.spotify.com/documentation/web-api/reference/users-profile/get-current-users-profile/
 */
export const getCurrentUser = () => axios.get('/me');

/**
 * Get Specific User
 * https://developer.spotify.com/documentation/web-api/reference/users-profile/get-current-users-profile/
 */
export const getUserById = (id) => {
  return axios.get(`/users/${id}`);
};

/**
 * Get a List of Current User's Playlists
 * https://developer.spotify.com/documentation/web-api/reference/#endpoint-get-a-list-of-current-users-playlists
 * @returns {Promise}
 */
export const getUserPlaylists = (limit = 20) => {
  return axios.get(`/me/playlists?limit=${limit}`);
};

/**
 * Get specific playlist
 * @returns {Promise}
 */
export const getPlaylistById = (id) => {
  // '15a8yM3uV2nouNvpbeAhYl' Weekly Movie Scores Playlist Id
  return axios.get(`/playlists/${id}`);
};

/**
 * Get specific playlist
 * @returns {Promise}
 */
export const getGenres = (id) => {
  // '15a8yM3uV2nouNvpbeAhYl' Weekly Movie Scores Playlist Id
  return axios.get(`/recommendations/available-genre-seeds`);
};

/**
 * Search Query
 * @returns {Promise}
 */
export const searchSpotify = (searchText) => {
  // spotifyApi.searchArtists('search?q=album:The+Son+(Original+Motion+Picture+Soundtrack)+artist:Hans+Zimmer&type=album')
  // maybe uptdate this to take album , artist, and type fields?
  return axios.get(`/search?q=${searchText}`);
};

/**
 * Get Specific Artist
 * @returns {Promise}
 */
export const getArtistById = (id) => {
  // "0YC192cP3KPCRWx8zr8MfZ" id for hans zimmer
  return axios.get(`/artist/${id}`);
};

/**
 * Get specific Album
 * @returns {Promise}
 */
export const getAlbumById = (id) => {
  return axios.get(`/albums/${id}`);
};

/**
 * Add Tracks to a Playlist
 * https://developer.spotify.com/documentation/web-api/reference/playlists/add-tracks-to-playlist/
 */
export const addTracksToPlaylist = (playlistId, uris) => {
  const url = `/playlists/${playlistId}/tracks?uris=${uris}`;
  return axios({ method: 'post', url });
};

/**
 * Get a Playlist's Tracks
 * https://developer.spotify.com/documentation/web-api/reference/playlists/get-playlists-tracks/
 */
export const getPlaylistTracks = playlistId =>
  axios.get(`/playlists/${playlistId}/tracks`);

/**
 * Get a Album's Tracks
 * https://developer.spotify.com/documentation/web-api/reference/playlists/get-playlists-tracks/
 */
export const getAlbumTracks = albumId =>
  axios.get(`/albums/${albumId}/tracks`);

/**
 * Add Tracks to a Playlist
 * https://developer.spotify.com/documentation/web-api/reference/playlists/add-tracks-to-playlist/
 */
export const clearPlaylist = (playlistId, tracks) => {
  const url = `/playlists/${playlistId}/tracks`;
  return axios.delete(url, { data: tracks });
};

/**
 * Check if Users Follow a Playlist
 * https://developer.spotify.com/documentation/web-api/reference/follow/follow-artists-users/
 */
export const doesUserFollowPlaylist = (playlistId, userId) =>
  axios.get(`/playlists/${playlistId}/followers/contains?ids=${userId}`);

/**
 * Follow a Playlist
 * https://developer.spotify.com/documentation/web-api/reference/follow/follow-playlist/
 */
export const followPlaylist = playlistId => {
  const url = `/playlists/${playlistId}/followers`;
  return axios({ method: 'put', url });
};

/**
 * Return a comma separated string of track IDs from the given array of tracks
 */
// const getTrackIds = tracks => tracks.map(({ track }) => track.id).join(',');

/**
 * Get a Track
 * https://developer.spotify.com/documentation/web-api/reference/tracks/get-track/
 */
export const getTrack = trackId =>
  axios.get(`/tracks/${trackId}`);

