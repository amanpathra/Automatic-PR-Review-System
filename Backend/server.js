import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import connectToMongo from './db.js';
import { Token } from './db.js';
import verifySignature from './verifySignature.js';
import connectSmee from './smee.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import getAIReview from './aireview.js';
import http from 'http';
import * as WebSocket from 'ws';
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.WebSocketServer({ server });


app.use(cors());
app.use(bodyParser.json());
dotenv.config({ path: '.env.local' });

connectToMongo();
const events = connectSmee();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = 5000;
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;


app.post('/exchange-code', async (req, res) => {

    try{
        const { code } = req.body;

        if (!code) {
            console.log('No code.');
            return res.status(400).json({ error: 'Authorization code is required' });
        }

        const promise = await fetch("https://github.com/login/oauth/access_token", {
            method: 'POST',
            headers: {
                'Accept': 'application/json',  // Accept JSON response
                'Content-Type': 'application/x-www-form-urlencoded',  // Send form URL-encoded data
            },
            body: new URLSearchParams({
                client_id: clientId,
                client_secret: clientSecret,
                code: code,
            }),
        });
    
        if (!promise.ok) {
            return res.status(promise.status).json({ error: `GitHub OAuth failed with status ${promise.status}` });
        }
        
        const data = await promise.json();
        
        const exists = await Token.exists({});
        
        if(exists){
            await Token.findOneAndUpdate(
                {},
                { access_token: data.access_token },
                { new: true, upsert: true }
            )
        }
        else{
            const tokenDoc = new Token({
                access_token: data.access_token,
                token_type: data.token_type,
                scope: data.scope
            });
            await tokenDoc.save();
        }

        return res.status(200).json({access_token: data.access_token});
    } catch (error) {
        console.error("Error occurred:", error);
        return res.status(500).json({error: error});
    }
});

function logToFile(data, fileName) {
    const logFilePath = path.join(__dirname, fileName);  // Path to the log file

    // Append the log data (converted to a string) to the file
    fs.appendFile(logFilePath, `${new Date().toISOString()} - ${JSON.stringify(data, null, 2)}\n\n`, (err) => {
        if (err) {
            console.error('Failed to write to log file:', err);
        }
    });
}

const makeComment = async (repository, pull_number, review) => {

    const owner = repository.owner.login;
    const repo = repository.name;
    const token = (await Token.findOne({})).access_token;

    const url = `https://api.github.com/repos/${owner}/${repo}/issues/${pull_number}/comments`;

    const comment = {
        body: review
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `token ${token}`,
            'Content-Type': 'application/json',
            'User-Agent': 'Node.js'
        },
        body: JSON.stringify(comment)
    })

    return response;
}

// const clients = [];

// const makeLog = async (log) => {
//     try{

//     }
//     catch(error){

//     }
// }

// app.get('/logs', (req, res) => {

//     res.setHeader('Content-Type', 'text/event-stream');
//     res.setHeader('Cache-Control', 'no-cache');
//     res.setHeader('Connection', 'keep-alive');

//     clients.push(res);

//     req.on('close', () => {
//         clients = clients.filter(client => client !== res);
//     })
// })

const clients = new Set();

// WebSocket connection handler
wss.on('connection', (ws) => {
    // Add the client to the Set
    clients.add(ws);

    // console.log(WebSocket.WebSocket.OPEN);

    // Listen for a message from the client to register the repository
    ws.on('message', (message) => {
        const { username } = JSON.parse(message);

        console.log(username, "hi");

        // Attach the repository info directly to the WebSocket client instance
        if (username) {
            ws.username = username; // This will help identify the repository each client wants
        }
    });

    // Clean up on client close
    ws.on('close', () => {
        clients.delete(ws);
    });
});

function getFormattedDateTime() {
    const options = {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    };

    const now = new Date();
    return now.toLocaleDateString('en-US', options);
}

const makeLog = async (username,  type, message) => {
    for (const client of clients) {
        console.log(client.username, username, client.readyState, WebSocket.WebSocket.OPEN);
        // Only send the update if the client's repository matches and the connection is open
        if (client.username === username && client.readyState === WebSocket.WebSocket.OPEN) {
            console.log("Sent");
            client.send(JSON.stringify({type, message, time: getFormattedDateTime()}));
        }
    }
}

// Route to handle GitHub webhook events
app.post('/webhook', bodyParser.json({ verify: verifySignature }), async (req, res) => {
    const event = req.headers['x-github-event'];

    const { repository } = req.body;

    // logToFile(req.body, 'webhook-log.txt');

    if (event === 'pull_request' && (req.body.action === 'opened' || req.body.action === 'reopened')) {
        const pullRequest = req.body.pull_request;
        const repoOwner = repository.owner.login;

        makeLog(repoOwner, 1, `${pullRequest.user.login} ${req.body.action} a pull request in your repository '${repository.name}'.`);

        makeLog(repoOwner, 2, `Getting a review from our AI Model.`);

        const review = await getAIReview(pullRequest);

        // logToFile(review, 'reviews.txt');

        makeLog(repoOwner, 3, `Posting the review as a comment on the PR.`);

        const resComment = await makeComment(req.body.repository, pullRequest.number, review);

        if(!resComment.ok){
            console.log(`Error: ${resComment.status} ${resComment.statusText }`);
            makeLog(repoOwner, 4, `Sorry, We were unable to post the review.`);
        }
        else{
            const commentData = await resComment.json();
            makeLog(repoOwner, 5, `The review has been posted successfully.`);
            console.log("Comment posted successfully.");
        }
    }

    return res.status(200).send('Webhook received');
});

server.listen(PORT, console.log(`Server running on http://localhost:${PORT}/`));