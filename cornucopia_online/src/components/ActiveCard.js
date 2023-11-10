import React, {Component } from 'react';
import {getCardById} from './CardsService';
import SmallCard from './smallCard';
import BigCard from './bigCard';

class ActiveCard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedCard:"",
            showBig: false,
            displayData: [],
            hiddenClass: "acNotHidden",
        };
        //this.selectCard = this.selectCard.bind(this);
        this.showBig = this.showBig.bind(this);
        this.exitBig = this.exitBig.bind(this);
        this.toogleDisplay = this.toogleDisplay.bind(this);

    }

    componentDidMount(){
        let displayData = []
        this.props.cards.forEach((cardId)=>{
            let card = getCardById(cardId, this.props.savedData.cardset)

            displayData.push(card);
        });
        this.setState({displayData: displayData});

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
        if (this.state.hiddenClass === "acNotHidden"){
            this.setState({hiddenClass: "acHidden"});
        } else {
            this.setState({hiddenClass: "acNotHidden"});
        }
    }
    showToogle(){
        if (this.state.hiddenClass === "acHidden"){
            return(
                <div onClick={this.toogleDisplay} className="ActiveCardToogle arrLeft"/>
            );
        } else {
            return(
                <div onClick={this.toogleDisplay} className="ActiveCardToogle arrRight"/>
            );
        }
    }
    render = () => {
        return (
            <div className={"ActiveCard " + this.state.hiddenClass}>
                {this.showToogle()}
                <div>Current Card</div>
                {this.state.displayData.map(card => (
                    <SmallCard key={card.id} savedData={this.props.savedData} cardId={card.id} desc={card.desc} suit={card.suit} showBig={this.showBig}/>
                ))}
                {this.displayBig()}

            </div>
        );
    };
}

export default ActiveCard;
