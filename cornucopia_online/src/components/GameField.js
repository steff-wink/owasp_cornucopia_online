import React, {Component } from 'react';
import Canvas from './Canvas';
import MyCards from './MyCards';
import ActiveCard from './ActiveCard';
import Scoreboard from './scoreboard';
import GameControls from './GameControls';


class GameField extends Component {
    constructor(props) {
        super(props);
        this.state = {
            password: this.props.password,
            comment: "",
            ws: null,
            canvasData: null,
            currentChanged: false,
            updateInterval: null,
            savedData: null,
            currentData:null
        };
        this.handleServerReturn = this.handleServerReturn.bind(this);
        this.updateComment = this.updateComment.bind(this);
        this.canvasDataUpdateFunc = this.canvasDataUpdateFunc.bind(this);
        this.endTurn = this.endTurn.bind(this);
        this.startTurn = this.startTurn.bind(this);
        this.addVote = this.addVote.bind(this);
        this.delVote = this.delVote.bind(this);
    }
    componentDidMount(){
        let ws = this.props.ws;
        ws.addEventListener("message", res => {
            this.handleServerReturn(res.data);
        });
        const interval = setInterval(() => {
            this.sendUpdate();
          }, 1000);
        console.log(this.props.projectData);
        this.setState({
            ws: ws, 
            updateInterval: interval,
            password: this.props.projectData.password,
            savedData: this.props.projectData.data,
            currentData:this.props.projectData.current
        });
    }
    sendUpdate(){
        if (this.state.currentChanged === true){
            console.log("Send Update");
            this.state.ws.send(JSON.stringify({type: "updateCurrent", currentData: this.state.currentData}));
            this.setState({currentChanged: false});
        }
    }

    updateComment(e){
        let opt = this.state.currentData;
        opt.comment = e.target.value;
        console.log(opt);
        this.setState({currentData: opt, currentChanged: true});

    }
    endTurn(){
        this.state.ws.send(JSON.stringify({type:"endTurn"}));
    }
    startTurn(cardId){
        this.state.ws.send(JSON.stringify({type:"startTurn", cardId: cardId, player: this.props.user.userId}));

    }
    handleServerReturn(payload){
        payload = JSON.parse(payload);
        if (payload.type === "updateCurrent"){
            console.log("updateCurrent received", payload.currentData);
            this.setState({currentData: payload.currentData});
        } else if (payload.type === "updateData"){
            console.log("updateData received", payload.savedData);
            if (typeof payload.currentData === "undefined"){
                //e.g. if Player joins
                this.setState({savedData: payload.savedData});
            } else {
                this.setState({savedData: payload.savedData, currentData: payload.currentData});
            }
        } else if (payload.type === "voteUpdate"){
            console.log("voteUpdate received", payload.votes);
            let currentData = this.state.currentData;
            currentData.votes = payload.votes;
            this.setState({currentData: currentData});
        } else if (payload.type === "msg"){
            window.alert(payload.msg);
        }
    }

    canvasDataUpdateFunc(type, currentSquare){
        if (type === "updateCurrent" && this.state.savedData.activePlayer === this.props.user.userId){
            let opt = this.state.currentData;
            opt.square = currentSquare;
            this.setState({currentData: opt, currentChanged: true});
        }
    }
    getPlayerCards(){
        let players = this.state.savedData.players
        let cards = [];
        players.forEach((player) => {
            if (player.uuid === this.props.user.userId){
                cards = player.cards
            }
        })
        return cards;
    }
    
    displayActiveCard(){
        if (this.state.savedData.activeCard !== ""){
            return <ActiveCard cards={[this.state.savedData.activeCard]} savedData={this.state.savedData} />
        }
    }
    getActivPlayerName(){
        let playerName=""
        this.state.savedData.players.forEach((player) =>{
            if (player.uuid === this.state.savedData.activePlayer){
                playerName = player.name;
            }
        })
        return playerName;
    }


    displayComment(){
        if (this.state.savedData.activePlayer === this.props.user.userId){
            return(
                <div className="comment">
                    <div>Your turn</div>
                    <table><tbody>
                        <tr>
                            <td style={{width:"20%"}}>
                                Kommentar:<br/>
                                
                                <button onClick={this.endTurn}>End Turn</button>
                            </td>
                            <td style={{width:"80%"}}>
                                <textarea style={{width:"95%", height: "95%"}} onChange={this.updateComment} value ={this.state.currentData.comment}/><br/>
                            </td>
                        </tr>
                    </tbody></table>
                </div>
            );
            } else if (this.state.savedData.activeCard !== ""){
                return(
                    <div className="comment">
                        <div>{this.getActivPlayerName()}'s turn</div>
                        <table><tbody>
                            <tr>

                                <td style={{width:"20%"}}>
                                    Kommentar:<br/>
                                    {this.showVoteButton()}
                                </td>
                                <td style={{width:"80%"}}>
                                    <textarea style={{width:"95%", height: "95%"}} readOnly value ={this.state.currentData.comment}/><br/>
                                </td>
                            </tr>
                        </tbody></table>
                    </div>
                );
            }
    }

    showVoteButton(){
        if (this.state.currentData && this.state.currentData.votes.includes(this.props.user.userId)){
            return <button onClick={this.delVote}>Unlike</button>
        } else {
            return <button onClick={this.addVote}>Like</button>
        }
    }
    addVote(){
        this.state.ws.send(JSON.stringify({type:"addVote", userId: this.props.user.userId}));
    }
    delVote(){
        this.state.ws.send(JSON.stringify({type:"delVote", userId: this.props.user.userId}));
    }



    
    render = () => {
       
        if (this.state.savedData){
            return (
                <div className="GameField">
                    {this.displayComment()}
                    <Canvas width={4000} height={2200} 
                        saveddata={this.state.savedData} 
                        currentsquare={this.state.currentData.square} 
                        picture={this.props.picture} 
                        updateFunc={this.canvasDataUpdateFunc} 
                        isActivePlayer={(this.state.savedData.activePlayer === this.props.user.userId)} 
                    />
                    <MyCards cards={this.getPlayerCards()} savedData={this.state.savedData} startTurn={this.startTurn}/>
                    {this.displayActiveCard()}
                    <Scoreboard savedData={this.state.savedData} currentData={this.state.currentData} />
                    <GameControls ws={this.state.ws} closeFunc={this.props.closeFunc} findings={this.state.savedData.findings} room={this.state.savedData.room}/>
                </div>
            );
        } else {
            return (
                <div>
                    <h2>Gamefield</h2>
                </div>
            );
        }
    };
}

export default GameField;
