// Importing the required modules
const WebSocketServer = require('ws');
const url = require('url');
const fs = require('fs');
const express = require('express');
const path = require('path');
const app = express();
let projectCache = {};
let serverPort = 3000

app.use(express.static("build"));
 
// Creating a new websocket server
//const wss = new WebSocketServer.Server({ port: 3001 })
const wss = new WebSocketServer.Server({ noServer: true })

const server = app.listen(serverPort);
server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, socket => {
        wss.emit('connection', socket, request);
  });
});

// Creating connection using websocket
wss.on("connection", (ws, req) => {
    console.log(req);
    const parameters = url.parse(req.url, true);
    ws.project = parameters.query.project;
    ws.projectHash = hash(parameters.query.project);
    log(ws, "New client connected to project-url: '" + ws.project + "'");
    ws.on("message", data => {
        data = JSON.parse(data);
        if (data.type === "join"){
            joinProject(ws, data);
        } else if (data.type === "create") {
            createProject(ws, data);
        }  else if (data.type === "dealOneCard") {

        }  else if (data.type === "updateCurrent") {
            updateCurrentData(ws, data);
        }  else if (data.type === "startTurn") {
            startTurn(ws, data);
        } else if (data.type === "endTurn") {
            endTurn(ws);
        } else if (data.type === "addVote") {
            addVote(ws, data);
        } else if (data.type === "delVote") {
            delVote(ws, data);
        } else if (data.type === "dealCard") {
            dealCard(ws, data);
        } else if (data.type === "forceTurnEnd") {
            forceTurnEnd(ws, data);
        }

    });
    // handling what to do when clients disconnects from server
    ws.on("close", () => {
        console.log("the client has connected");
    });
    // handling client connection error
    ws.onerror = function () {
        console.log("Some Error occurred")
    }

});
console.log("The WebSocket server is running on port " + serverPort);


wss.broadcast = function broadcast(msg, room) {
    //console.log(msg);
    wss.clients.forEach((client) => {
        if (client.project === room){
            client.send(msg);
        }
     });
 };


const addUser = (userId, userName, projectData) => {
    //check if userID exists already on Project, don't add
    let playerExists = false;
    projectData.savedData.players.forEach((player) => {
        if (player.uuid === userId){
            playerExists = true;
        }
    });
    if (playerExists){
        return;
    }
    let newPlayer = {
        uuid: "",
        name: "",
        cards: [],
    };
    newPlayer.uuid = userId;
    newPlayer.name = userName;
    let undealt = projectData.savedData.undealt;
    let cards = [];
    for (let i = 0; i < 5; i++) {
        if (undealt.length > 0){
            let index = Math.round(Math.random() * (undealt.length - 1));
            cards.push(undealt[index]);
            undealt.splice(index, 1);
        }
    }
    newPlayer.cards = cards;
    projectData.savedData.undealt = undealt;
    projectData.savedData.players.push(newPlayer);
}

const newProjectBase = () => {
    let newProject = {
        room: "test",
        cardset: "cornucopia",
        undealt:["DV2","DV3","DV4","DV5","DV6","DV7","DV8","DV9","DVX","DVJ","DVQ","DVK","DVA","AC2","AC3","AC4","AC5","AC6","AC7","AC8","AC9","ACX","ACJ","ACQ","ACK","ACA","SM2","SM3","SM4","SM5","SM6","SM7","SM8","SM9","SMX","SMJ","SMQ","SMK","SMA","AZ2","AZ3","AZ4","AZ5","AZ6","AZ7","AZ8","AZ9","AZX","AZJ","AZQ","AZK","AZA","CR2","CR3","CR4","CR5","CR6","CR7","CR8","CR9","CRX","CRJ","CRQ","CRK","CRA","CO2","CO3","CO4","CO5","CO6","CO7","CO8","CO9","COX","COJ","COQ","COK","COA","JOA","JOB"],
        imageHashMD5: "lskdfks4323urfwfjhwrwfefh94e",
        cardsPerPlayer: 5,
        gamePhase: "game",
        activeCard: "",
        activePlayer: "",
        players: [],
        findings: []
    };
    return newProject;
}

const createUuid = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        // eslint-disable-next-line
        var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
}


const createProject = async (ws, data) => {
    //check if Project exists, check if password not empty
    if (data.password === "" ){
        ws.send(JSON.stringify({msg: "password cannot be empty string"}));
        return;
    }
    if(ws.projectHash in projectCache){
        ws.send(JSON.stringify({msg: "project already exists, pls use join or choose different project name"}));
        return;
    }
    let fileExists = await fs.promises.access("storage/" + ws.projectHash+".json", fs.constants.F_OK).then(() => true).catch(() => false);
    if (fileExists){
        ws.send(JSON.stringify({msg: "project already exists, pls use join or choose different project name"}));
        return;
    }
    ws.userId = data.userId;
    let projectData = {};
    projectData.savedData = newProjectBase();
    projectData.savedData.room  = data.project
    addUser(data.userId, data.userName, projectData)
    projectData.picture = data.picture;
    projectData.currentData = {comment: "", square:{x: 0, y: 0, width: 0, height: 0}, votes:[]};
    projectData.lastChanged = Date.now();
    ws.send(JSON.stringify({
        type: "created", 
        data: projectData.savedData, 
        picture: projectData.picture, 
        currentData: projectData.currentData
    }));
    projectCache[ws.projectHash] = projectData
    log(ws, "project created by player name: " + data.userName); 
    log(ws, "project hash: " + ws.projectHash);  
}

const joinProject = async (ws, data) => {
    if (data.password === "" ){
        ws.send(JSON.stringify({msg: "password cannot be empty string"}));
        return;
    }
    if(!(ws.projectHash in projectCache)){
        let fileExists = await fs.promises.access("storage/" + ws.projectHash+".json", fs.constants.F_OK).then(() => true).catch(() => false);
        if (fileExists){
            let projectData =  await fs.promises.readFile("storage/" + ws.projectHash + ".json");
            projectData = JSON.parse(projectData);
            projectCache[ws.projectHash] = projectData;
            console.log("1", projectData);
        } else {
            ws.send(JSON.stringify({msg: "project does not exist"}));
            return;
        }
    }
    projectCache[ws.projectHash].lastChanged = Date.now();
    addUser(data.userId, data.userName, projectCache[ws.projectHash])
    ws.userId = data.userId;
    ws.send(JSON.stringify({
        type: "joined", 
        data: projectCache[ws.projectHash].savedData, 
        picture: projectCache[ws.projectHash].picture, 
        currentData: projectCache[ws.projectHash].currentData
    }));
    wss.broadcast(JSON.stringify({type: "updateData", savedData: projectCache[ws.projectHash].savedData}), ws.project)
    log(ws, "project joined by player name: " + data.userName);
}

const startTurn = (ws, data) => {
    //current Data added as new Finding
    projectCache[ws.projectHash].savedData.activeCard = data.cardId;
    projectCache[ws.projectHash].savedData.activePlayer= data.player;
    projectCache[ws.projectHash].currentData = {comment: "", square:{x: 0, y: 0, width: 0, height: 0}, votes:[]};
    wss.broadcast(JSON.stringify({
        type: "updateData", 
        savedData: projectCache[ws.projectHash].savedData, 
        currentData: projectCache[ws.projectHash].currentData
    }), ws.project)

}

const updateCurrentData = (ws, data) => {
    projectCache[ws.projectHash].currentData = data.currentData;
    wss.broadcast(JSON.stringify({
        type: "updateCurrent", 
        currentData: data.currentData
    }), ws.project)
        
}

const addVote = (ws, data) => {
    if (!projectCache[ws.projectHash].currentData.votes.includes(data.userId)){
        projectCache[ws.projectHash].currentData.votes.push(data.userId);
    }
    wss.broadcast(JSON.stringify({type: "voteUpdate", votes: projectCache[ws.projectHash].currentData.votes}), ws.project)
}

const delVote = (ws, data) => {
    let index = projectCache[ws.projectHash].currentData.votes.indexOf(data.userId);
    if (index !== -1) {
        projectCache[ws.projectHash].currentData.votes.splice(index, 1);
    }
    wss.broadcast(JSON.stringify({type: "voteUpdate", votes: projectCache[ws.projectHash].currentData.votes}), ws.project)
}

const endTurn = (ws) => {
    //check if sender ws ID is aktivePlayer
    //find max id
    const max = projectCache[ws.projectHash].savedData.findings.reduce((prev, current) => (prev.id > current.id) ? prev : current, 0)
    //current Data added as new Finding
    let newId = max +1;
    if (newId == null) {newId = 1;}
    if (ws.userId === projectCache[ws.projectHash].savedData.activePlayer){
        let newFinding = {
            uuid: createUuid(),
            card: projectCache[ws.projectHash].savedData.activeCard,
            square: projectCache[ws.projectHash].currentData.square,
            comment: projectCache[ws.projectHash].currentData.comment,
            votes: projectCache[ws.projectHash].currentData.votes,
            player: projectCache[ws.projectHash].savedData.activePlayer,
            id: max + 1
        };
        projectCache[ws.projectHash].savedData.findings.push(newFinding);
        projectCache[ws.projectHash].savedData.activeCard = "";
        projectCache[ws.projectHash].savedData.activePlayer= "";
        projectCache[ws.projectHash].lastChanged = Date.now();
        projectCache[ws.projectHash].currentData = {comment: "", square:{x: 0, y: 0, width: 0, height: 0}, votes:[]};
        wss.broadcast(JSON.stringify({
            type: "updateData", 
            savedData: projectCache[ws.projectHash].savedData, 
            currentData: projectCache[ws.projectHash].currentData
        }), ws.project)
    } else {
        ws.send(JSON.stringify({
            type: "msg", 
            msg: "it's not your turn, you cannot end it, use force turn end instead"
        }));
    }
}


const dealCard = (ws, data) => {
    let playerName = ""
    projectCache[ws.projectHash].savedData.players.forEach((player) => {
        let undealt = projectCache[ws.projectHash].savedData.undealt;
        if (player.uuid == ws.userId){
            playerName = player.name;
        }
        if (undealt.length > 0){
            let index = Math.round(Math.random() * (undealt.length - 1));
            player.cards.push(undealt[index]);
            undealt.splice(index, 1);
        }
    });
    wss.broadcast(JSON.stringify({
        type: "updateData", 
        savedData: projectCache[ws.projectHash].savedData
    }), ws.project)
    wss.broadcast(JSON.stringify({
        type: "msg", 
        msg: "new card dealt by " + playerName
    }), ws.project)
}
const forceTurnEnd = (ws, data) => {
    let playerName = ""
    projectCache[ws.projectHash].savedData.players.forEach((player) => {
        if (player.uuid == ws.userId){
            playerName = player.name;
        }
    });
    if (playerName != ""){
        projectCache[ws.projectHash].savedData.activeCard = "";
        projectCache[ws.projectHash].savedData.activePlayer= "";
        projectCache[ws.projectHash].currentData = {comment: "", square:{x: 0, y: 0, width: 0, height: 0}, votes:[]};
        wss.broadcast(JSON.stringify({
            type: "updateData", 
            savedData: projectCache[ws.projectHash].savedData, 
            currentData: projectCache[ws.projectHash].currentData
        }), ws.project)
        wss.broadcast(JSON.stringify({
            type: "msg", 
            msg: "turn ending was forced by " + playerName + ", turn was reset"
        }), ws.project)
    }
}

const log = (ws, message) => {
    let date = new Date(Date.now());
    let timestamp = date.getFullYear()+"-"+date.getMonth()+1+"-"+date.getDay()+"_"+date.getHours()+":"+date.getMinutes()+":"+date.getSeconds();
    console.log(timestamp + "[" + ws.project + "|" + ws.userId + "]  " + message);
}



const hash = (str) => {
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
        var cha = str.charCodeAt(i);
        hash = ((hash<<5)-hash)+cha;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString().replace("-", "");
}



const interval = setInterval(() => {
    saveProjectCacheToFiles();
  }, 20000);

  const saveProjectCacheToFiles = async () => {
    Object.entries(projectCache).forEach((projectHash) => {
        if (typeof projectHash[1].lastBackup === "undefined" || projectHash[1].lastBackup < projectHash[1].lastChanged){
            console.log("saving: " + projectHash[0]);
            projectCache[projectHash[0]].lastBackup = Date.now();
            fs.promises.writeFile("storage/" + projectHash[0] + ".json", JSON.stringify(projectHash[1]));
        }
    })
  }