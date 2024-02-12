import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import random from 'random-world';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",  
        methods: ["GET", "POST"]
    }
});

app.use(cors());

app.get('/', (req, res) => {
    res.send('<h1>Auction Socket Demo</h1><h2>Listens to</h2><ul><li>bid</li></ul><h2>Emits</h2><ul><li>yourID, id</li><li>WinnerOfAuction - winnersID, cost, newLocation</li><li>newHighBidder - bidderID, amount, country</li></ul>');
});

let currentBid = 500 //all bids start at 500
let currentWinningBidder = "" 
let currentCountry = random.country();

setInterval(()=>{
    if (currentWinningBidder != ""){
        io.emit("WinnerOfAuction", currentWinningBidder, currentBid, currentCountry);
        //reset
        currentCountry = random.country();
        currentBid = 500; 
        currentWinningBidder = ""
    }else {
        io.emit("AuctionContinues", currentBid, currentCountry)
    }
}, 30_000)

// Handle a socket connection request from a web client
io.on('connection', (socket) => {
    
    socket.emit("yourID", socket.id);

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });

    socket.on("bid", ()=>{
        currentBid += 50; 
        currentWinningBidder = socket.id; 
        console.log(`${socket.id} just bid ${currentBid}`);
        socket.broadcast.emit("newHighBidder", socket.id, currentBid, currentCountry)
    })
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`Listening on port ${port}`);
});