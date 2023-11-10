import React, {Component } from 'react';
import {getCardById} from './CardsService';
import SmallCard from './smallCard';
import BigCard from './bigCard';

class MyCards extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedCard:"",
            showBig: false,
            displayData: [],
            hiddenClass: "mcNotHidden",
            cardsMergedString: ""
        };
        //this.selectCard = this.selectCard.bind(this);
        this.showBig = this.showBig.bind(this);
        this.exitBig = this.exitBig.bind(this);
        this.toogleDisplay = this.toogleDisplay.bind(this);

    }

    componentDidMount(){
        this.collectCardInformation();

    }

    collectCardInformation(){
        let displayData = [];
        this.props.cards.forEach((cardId)=>{
            let card = getCardById(cardId, this.props.savedData.cardset)

            displayData.push(card);
        });
        this.setState({displayData: displayData, cardsMergedString: this.props.cards.join('')});
    }

    showBig(id){
        console.log("hello");
        this.setState({selectedCard: id, showBig: true});
    }
    exitBig(){
        this.setState({showBig: false});
    }
    displayBig(){
        if (this.state.showBig){
            let card = getCardById(this.state.selectedCard, this.props.savedData.cardset);
            return(
                <BigCard card={card} exitBig={this.exitBig}/>
            );
        }
    }
    toogleDisplay(){
        if (this.state.hiddenClass === "mcNotHidden"){
            this.setState({hiddenClass: "mcHidden"});
        } else {
            this.setState({hiddenClass: "mcNotHidden"});
        }
    }
    showHidder(){
        if (this.state.hiddenClass === "mcHidden"){
            return(
                <div onClick={this.toogleDisplay} className="MyCardsToogle arrRight"/>
            );
        } else {
            return(
                <div onClick={this.toogleDisplay} className="MyCardsToogle arrLeft"/>
            );
        }
    }
    render = () => {
        if (this.state.cardsMergedString !== this.props.cards.join('')){
            this.collectCardInformation();
        }
        return (
            <div className={"MyCards " + this.state.hiddenClass}>
                {this.showHidder()}
                <h2>My Cards</h2>
                {this.state.displayData.map(card => (
                    <SmallCard key={card.id} savedData={this.props.savedData} cardId={card.id} desc={card.desc} suit={card.suit} showBig={this.showBig} startTurn={this.props.startTurn}/>
                ))}
                {this.displayBig()}

            </div>
        );
    };
}

export default MyCards;
