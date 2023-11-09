import React, {Component } from 'react';

class Scoreboard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            hiddenClass: "sbNotHidden",
        };
        this.toogleDisplay = this.toogleDisplay.bind(this);

    }

    showBoard(){
        let players=[];
        this.props.savedData.players.forEach((player) =>{
            let result = {uuid: player.uuid, name: player.name, points: 0};
            this.props.savedData.findings.forEach((finding)=>{
                if (finding.player === player.uuid){
                    result.points = result.points + 1 + finding.votes.length;
                }
            })
            players.push(result);
        });
        if (this.props.currentData.comment !== ""){
            let result = {name: "current turn", points: 0};
            result.points = result.points + 1 + this.props.currentData.votes.length;
            players.push(result);
        }
        return(
            <table>
                <tbody>
                    <tr><td>Player</td><td>Points</td></tr>
                    {players.map(player => (
                        <tr key={player.uuid}><td>{player.name}</td><td>{player.points}</td></tr>
                    ))}
                </tbody>
            </table>
        );
    }

    toogleDisplay(){
        if (this.state.hiddenClass === "sbNotHidden"){
            this.setState({hiddenClass: "sbHidden"});
        } else {
            this.setState({hiddenClass: "sbNotHidden"});
        }
    }
    showHidder(){
        if (this.state.hiddenClass === "sbHidden"){
            return(
                <div onClick={this.toogleDisplay} className="ScoreboardToogle arrLeft" />
            );
        } else {
            return(
                <div onClick={this.toogleDisplay} className="ScoreboardToogle arrRight"/>
            );
        }
    }
    render = () => {

        return (
            <div className={"Scoreboard " + this.state.hiddenClass}>
                {this.showHidder()}
                <h2>Scoreboard</h2>
                    {this.showBoard()}
            </div>
        );
    };
}

export default Scoreboard;
