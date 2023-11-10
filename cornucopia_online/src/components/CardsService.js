import ECcardsData from '../owasp_ressources/ecommerce-cards-1.21-en.json';
import ECcardsMapping from '../owasp_ressources/ecommerce-mappings-1.2.json'; 
import EOPcardsData from '../owasp_ressources/eop-cards--1.0-en.json'; 

export function getCardById (cardId, cardset){
    let cardsData;
    if (cardset == "ecommerce"){
    ECcardsData.suits.forEach((suit) => {
        suit.cards.forEach((card) => {
            if (card.id === cardId){
                cardsData = card;
                cardsData.suit = suit.name;
                cardsData.mapping={
                    "value": "",
                    "owasp_scp": [],
                    "owasp_asvs": [],
                    "owasp_appsensor": [],
                    "capec": [],
                    "safecode": []
                  };
            }
        })
    })
    ECcardsMapping.suits.forEach((suit) => {
        suit.cards.forEach((card) => {
            if (card.value === cardId){
                cardsData.mapping = card;
            }
        })
    })
    } else {
        EOPcardsData.suits.forEach((suit) => {
            suit.cards.forEach((card) => {
                if (card.id === cardId){
                    cardsData = card;
                    cardsData.suit = suit.name;
                    cardsData.mapping={
                        "value": "",
                        "owasp_scp": [],
                        "owasp_asvs": [],
                        "owasp_appsensor": [],
                        "capec": [],
                        "safecode": []
                      };
                }
            })
        })
    }
    return cardsData;
}
