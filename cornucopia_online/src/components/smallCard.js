import React, {Component } from 'react';

class SmallCard extends Component {
    cardClasses(){
        if (typeof this.props.savedData !== "undefined"){
            let played = false;

            let out = "";
            this.props.savedData.findings.forEach((finding)=>{
                if (finding.card === this.props.cardId){
                    played = true;
                }
            });
            if (played){
                out = "cardPlayed";
            }
            if (this.props.savedData.activeCard === this.props.cardId){
                out = out + " activCard";
            }
            return out; 
        } else {

        }
        return "";
    }

    showTurnButton(){
        if (typeof this.props.savedData !== "undefined" && typeof this.props.startTurn !== "undefined"){
            if (this.props.savedData.activeCard === ""){
                return <button onClick={()=> this.props.startTurn(this.props.cardId)}>Start turn</button>
            }
        }

    }

    displayFindings(){
        if (typeof this.props.savedData !== "undefined"){
            let count = 0;
            this.props.savedData.findings.forEach((finding)=>{
                if (finding.card === this.props.cardId){
                    count++;
                }
            });
            if (count > 0){
                return <span>{count} findings</span>;
            }
        }
    }


    render = () => {

            return (
                <div className={"smallCard " + this.cardClasses()} >
                    <div onClick={() => this.props.showBig(this.props.cardId)} className={this.props.cardId.substring(0,2) + " smCardHeading"}>
                        <h4 >{this.props.suit} {this.props.cardId.substring(2)}</h4>
                    </div>
                    <div>
                        <span>ID: {this.props.cardId}</span><br/>
                        <p className="overFlowText" >{this.props.desc}</p>
                    </div>
                    {this.displayFindings()}<br/>
                    {this.showTurnButton()}
                </div>
            );
    };
}

export default SmallCard;
