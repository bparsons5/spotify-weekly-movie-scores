require('dotenv').config()
const express = require('express')
const axios = require('axios')

const app = express();
const port = 8888

const authEndpoint = "https://accounts.spotify.com/authorize";
const CLIENT_ID = process.env.CLIENT_ID
const CLIENT_SECRET = process.env.CLIENT_SECRET
const REDIRECT_URI = process.env.REDIRECT_URI


/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
const generateRandomString = length => {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  };
  
  const stateKey = 'spotify_auth_state';


app.get('/', (req, res) =>{
    res.json({
        name: 'Brett',
        content: true
    })
})

app.get('/login', (req, res) =>{
    const state = generateRandomString(16)
    res.cookie(stateKey, state)

    const scopes = [
        "user-read-private",
        "user-read-email",
        "playlist-modify-private",
        "playlist-modify-public",
    ];

    // const {name, content} = req.query
    const searchparams = new URLSearchParams({
        client_id: CLIENT_ID,
        response_type: 'code',
        redirect_uri: REDIRECT_URI,
        state: state,
        scope: scopes
    })
    
    const queryParams = searchparams.toString()

    res.redirect(`${authEndpoint}?${queryParams}`)
})

app.get('/callback', (req, res) =>{
    // your application requests refresh and access tokens
    // after checking the state parameter

    const code = req.query.code || null;

    const searchparams = new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: REDIRECT_URI
    })
    
    const data = searchparams.toString()

    axios({
        method: 'post',
        url: 'https://accounts.spotify.com/api/token',
        data: data,
        headers: {
            'content-type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${new Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`
        }
    }).then(response => {
        if (response.status === 200) {
            const {access_token, refresh_token, expires_in} = response.data

            const paramsData = new URLSearchParams({
                access_token,
                refresh_token,
                expires_in
            })
            
            const params = paramsData.toString()

            res.redirect(`http://localhost:3000/?${params}`)

        } else {

            const errorData = new URLSearchParams({
                error: 'invalid token',
            })
            
            const error = errorData.toString()

            res.redirect(`/?${error}`)
        }
    }).catch(error => {
        res.send(error)
    })
})

app.get('/refresh_token', (req, res) => {
    const {refresh_token} = req.query

    const searchparams = new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refresh_token
    })
    
    const data = searchparams.toString()

    axios({
        method: 'post',
        url: 'https://accounts.spotify.com/api/token',
        data: data,
        headers: {
            'content-type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${new Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`
        }
    }).then(response => {
        res.send(JSON.stringify(response.data, null, 2))
    }).catch(error => {
        res.send(error)
    })
})

app.listen(port, () => {
    console.log(`Express app listening at http://localhost:${port}`)
})
