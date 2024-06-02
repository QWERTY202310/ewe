const express = require('express');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 3000;

const clientID = process.env.DISCORD_CLIENT_ID;
const clientSecret = process.env.DISCORD_CLIENT_SECRET;
const redirectURI = process.env.REDIRECT_URI || 'http://localhost:3000/callback';

app.get('/login', (req, res) => {
    const discordAuthURL = `https://discord.com/api/oauth2/authorize?client_id=${clientID}&redirect_uri=${encodeURIComponent(redirectURI)}&response_type=code&scope=identify%20email`;
    res.redirect(discordAuthURL);
});

app.get('/callback', async (req, res) => {
    const code = req.query.code;
    const tokenURL = 'https://discord.com/api/oauth2/token';
    const data = new URLSearchParams({
        client_id: clientID,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectURI,
        scope: 'identify email',
    });

    try {
        const tokenResponse = await axios.post(tokenURL, data, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        const accessToken = tokenResponse.data.access_token;
        const userResponse = await axios.get('https://discord.com/api/users/@me', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        const user = userResponse.data;
        res.send(`Hello ${user.username}#${user.discriminator}`);
    } catch (error) {
        console.error(error);
        res.send('An error occurred during authentication.');
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
