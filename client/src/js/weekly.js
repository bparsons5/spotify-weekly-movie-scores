
import { searchSpotify } from '../js/spotify';

/**
 * Grabs Weekly Movie Score Albums
 * https://developer.spotify.com/documentation/web-api/reference/users-profile/get-current-users-profile/
 */
export const weekly = async () => {

    // 2 ways to do this

    // 1 - search for OST, Soundtrack, Original Score, etc. and have the new tag (within the past 2 weeks) then use the release date to filter


    // 2 - use another api to get what movies came out this past weekend to then search for within spotify

    // spotifyApi.searchArtists('search?q=')
    const weeklyResponse = await searchSpotify('album:The+Son+(Original+Motion+Picture+Soundtrack)+artist:Hans+Zimmer&type=album');
    console.log(weeklyResponse)
};