import React, {Component } from 'react';

class GameControls extends Component {
    constructor(props) {
        super(props);
        this.state = {
            hiddenClass: "gcNotHidden",
        };
        this.toogleDisplay = this.toogleDisplay.bind(this);
        this.forceEnd = this.forceEnd.bind(this);
        this.dealCard = this.dealCard.bind(this);
        this.closeProject = this.closeProject.bind(this);
        this.copyLink = this.copyLink.bind(this);
        this.exportFindings = this.exportFindings.bind(this);

    }

    forceEnd(){
        if (window.confirm('Are you sure you want to end the turn, data from turn will be reset?')) {
            this.props.ws.send(JSON.stringify({type:"forceTurnEnd"}));
        }
    }

    exportFindings(){
        let findings = [...this.props.findings];
        let result = [];
        findings.forEach((finding) => {
            result.push({id: finding.id, comment: finding.comment, card: finding.card, votes: finding.votes.length});
        });
        result.sort((a, b) => b.votes - a.votes);
        var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(result));
        var dlAnchorElem = document.getElementById('downloadAnchorElem');
        dlAnchorElem.setAttribute("href",     dataStr     );
        dlAnchorElem.setAttribute("download", "findings.json");
        dlAnchorElem.click();
    }

    copyLink(){
        let link = "http://" + window.location.host + "?project=" + this.props.room;
        window.alert("ProjectUrl: " + link);
    }

    dealCard(){
        this.props.ws.send(JSON.stringify({type:"dealCard"}));
    }
    closeProject(){
        this.props.closeFunc();
    }

    toogleDisplay(){
        if (this.state.hiddenClass === "gcNotHidden"){
            this.setState({hiddenClass: "gcHidden"});
        } else {
            this.setState({hiddenClass: "gcNotHidden"});
        }
    }
    showHidder(){
        if (this.state.hiddenClass === "gcHidden"){
            return(
                <div onClick={this.toogleDisplay} className="GameControlsToogle arrDown" />
            );
        } else {
            return(
                <div onClick={this.toogleDisplay} className="GameControlsToogle arrUp" />
            );
        }
    }
    render = () => {

        return (
            <div className={"GameControls " + this.state.hiddenClass}>
                {this.showHidder()}
                Controls: <button onClick={this.forceEnd}>Force turn end</button>
                <button onClick={this.dealCard}>Deal 1 more card</button> 
                <button onClick={this.closeProject}>Close Project</button>
                <button onClick={this.copyLink}>Copy Link</button>
                <button onClick={this.exportFindings}>Export Findings</button>
                {/* eslint-disable-next-line*/}
                <a id="downloadAnchorElem" style={{ display: 'none' }}></a>
            </div>
        );
    };
}

export default GameControls;
