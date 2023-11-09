import React, {Component } from 'react';


class Header extends Component {
  showProject(){
      if (typeof this.props.room === "undefined"){
          return "";
      } else {
          return "- Projekt: " + this.props.room;
      }
  }
  showWsStatus(){
      if (this.props.ws === null){
          return "not connected";
      } else {
          return "connected";
      }
  }
  render = () => {
      return (
          <div className="heading">
              <span>OWASP Cornucopia - {this.props.text} {this.showProject()}  -  WebSocket: {this.showWsStatus()}</span>
              </div>
      );
  };
}

export default Header;
