import React, {Component } from 'react';

class BigCard extends Component {
    
    render = () => {

        return(
            <div className="bigCard">
                <div className="suitSide">
                    <div className={this.props.card.id.substring(0,2)}>
                        {this.props.card.suit}
                    </div>
                </div>
                <h3>{this.props.card.id.substring(2)}</h3>
                <p>{this.props.card.desc}</p>
                <hr/>
                <span>OWASP SCP</span><br/>
                <span>{this.props.card.mapping.owasp_scp.map(value => (<span>{value}, </span>))}</span>
                <hr/>
                <span>OWASP ASVS</span><br/>
                <span>{this.props.card.mapping.owasp_asvs.map(value => (<span>{value}, </span>))}</span>
                <hr/>
                <span>OWASP AppSensor</span><br/>
                <span>{this.props.card.mapping.owasp_appsensor.map(value => (<span>{value}, </span>))}</span>
                <hr/>
                <span>CAPEC</span><br/>
                <span>{this.props.card.mapping.capec.map(value => (<span>{value}, </span>))}</span>
                <hr/>
                <span>SAFEC ODE</span><br/>
                <span>{this.props.card.mapping.safecode.map(value => (<span>{value}, </span>))}</span>
                <button className="bigCardCLose" onClick={() => this.props.exitBig()}>Close</button>
            </div>
        );
    };
}

export default BigCard;
