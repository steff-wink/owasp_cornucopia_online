import React, {Component } from 'react';
import './App.css';
import Header from './components/Header';
import CreateJoinProject from './components/CreateJoinProject';
import GameField from './components/GameField';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      projectData: {},
      projectSelected: false,
      picture: null,
      ws: null,
      user: {userId: "", userName: ""},
    };
    this.updateProject = this.updateProject.bind(this);

  }
  updateProject(data, projectSel, ws, pic, userId, userName){
    this.setState({projectData: data, projectSelected: projectSel, ws: ws, picture: pic, user: {userId: userId, userName: userName}});
  }
  closeProject(){
    this.setState({projectData: {}, projectSelected: false, ws: null, picture: null, user: {userId: "", userName: ""}});
  }


  render = () => {
    if (this.state.projectSelected){
      return (
        <div>
          <Header text="Game area"  room={this.state.projectData.data.room} ws={this.state.ws}/>
          <GameField projectData={this.state.projectData} picture = {this.state.picture} ws={this.state.ws} user={this.state.user} closeFunc={this.closeProject}/>
        </div>
        
      );
    } else {
      return (
        <div>
          <Header text="Create or Join Project" ws={this.state.ws}/>
          <div className="centerCreateJoin">
            <CreateJoinProject type="create" updateProject={this.updateProject} ws={this.state.ws}/>
            <CreateJoinProject type="join" updateProject={this.updateProject} ws={this.state.ws}/>
          </div>
        </div>
      );
    }
  };
}

export default App;
