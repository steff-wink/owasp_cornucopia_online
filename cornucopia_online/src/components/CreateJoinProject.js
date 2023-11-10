import React, {Component } from 'react';
import localIdService from './localIdService';

class CreateJoinProject extends Component {
    constructor(props) {
        super(props);
        this.state = {
            projectName: "",
            password: "",
            ws: null,
            picture: null,
            disableButton: true,
            errorMsg: "",
            userId: "",
            userName: "",
            cardset: "ecommerce"
        };
        this.updateProjectName = this.updateProjectName.bind(this);
        this.updatePassword = this.updatePassword.bind(this);
        this.updateUsername = this.updateUsername.bind(this);
        this.createProject = this.createProject.bind(this);
        this.handleServerReturn = this.handleServerReturn.bind(this);
        this.handlePictureUpload = this.handlePictureUpload.bind(this);
        this.toogleButton = this.toogleButton.bind(this);
        this.handleCardSet = this.handleCardSet.bind(this);

    }
    updateProjectName(e){
        this.setState({projectName: e.target.value}, function() {
            this.toogleButton();
          });
    }
    handleCardSet(e){
        this.setState({cardset: e.target.value})
    }
    componentDidMount(){
        let projectName = "";
        if (this.props.type === "join"){
            const search = window.location.search;
            const params = new URLSearchParams(search);
            const project = params.get('project');
            if (project){
                console.log(project);
                projectName = project
            }
        }
        this.setState({userId: localIdService(), projectName: projectName});
        
    }
    updatePassword(e){
        this.setState({password: e.target.value}, function() {
            this.toogleButton();
          });
    }

    updateUsername(e){
        this.setState({userName: e.target.value}, function() {
            this.toogleButton();
          });
    }
    handlePictureUpload(event) {
        let files = event.target.files;
        let reader = new FileReader();
        reader.onload = (e) => {   
            this.setState({
                picture: e.target.result,
              }, function() {
                this.toogleButton();
            });
        }
        reader.readAsDataURL(files[0]);
    }

    toogleButton(){
        if (this.props.type === "create"){
            if (this.state.password !== "" && this.state.projectName !== "" && this.state.userName !== "" && this.state.picture !== null){
                this.setState({disableButton: false});
            } else {
                this.setState({disableButton: true});
            }
        } else {
            if (this.state.password !== "" && this.state.projectName !== "" && this.state.userName !== ""){
                this.setState({disableButton: false});
            } else {
                this.setState({disableButton: true});
            }
        }
        
    }
    createProject(){
        let payload;
        if (this.props.type === "create"){
            payload = JSON.stringify({
                type:"create", 
                project: this.state.projectName, 
                picture: this.state.picture, 
                userId: this.state.userId,
                userName: this.state.userName,
                password: this.state.password,
                cardset: this.state.cardset
            })
        } else if (this.props.type === "join"){
            payload = JSON.stringify({
                type:"join", 
                project: this.state.projectName, 
                userId: this.state.userId,
                userName: this.state.userName,
                password: this.state.password
            })
        }
        const ws = new WebSocket("ws://" + window.location.host + "/ws/?project="+this.state.projectName);
        ws.addEventListener("open", () =>{
            ws.send(payload);
        });
        ws.addEventListener("message", this.handleServerReturn);
        this.setState({ws: ws});
    }
    handleServerReturn(res){
        const payload = JSON.parse(res.data);
        let picture;
        if (payload.type === "created"){
            picture = payload.picture;
        } else if (payload.type === "joined"){
            picture = payload.picture;
        } else {
            this.state.ws.close();
            this.setState({ws: null, errorMsg: "Something went wrong: " + payload.msg});
            return;
        }
        let sendPayload = {
            projectName: this.state.projectName, 
            password: this.state.password, 
            data: payload.data, 
            current: payload.currentData
        };
        let ws = this.state.ws;
        console.log(sendPayload.data);
        ws.removeEventListener('message', this.handleServerReturn);
        this.props.updateProject(
            sendPayload, 
            true, 
            ws, 
            picture, 
            this.state.userId, 
            this.state.userName
        );

    }
    


    render = () => {
        if (this.props.type === "join"){
            return (
                <div className="CreateJoinInput">
                    <h2>Join project</h2>
                    Projectname:<br/>
                    <input value={this.state.projectName} onChange={this.updateProjectName}/><br/>
                    Password: <br/>
                    <input type="password" value={this.state.password} onChange={this.updatePassword}/><br/>
                    Your name: <br/>
                    <input value={this.state.userName} onChange={this.updateUsername}/><br/>
                    <button onClick={this.createProject} disabled={this.state.disableButton}>Join</button>
                    <br/>{this.state.errorMsg}
                </div>
            );
        } else {
            return (
                <div className="CreateJoinInput">
                    <h2>Create project</h2>
                    Projectname:<br/>
                    <input value={this.state.projectName} onChange={this.updateProjectName}/><br/>
                    Password: <br/>
                    <input type="password" value={this.state.password} onChange={this.updatePassword}/><br/>
                    Image of architecture:<br/>
                    <input type="file" className="form-control" name="upload_file" onChange={this.handlePictureUpload} /><br/>
                    Card set:<br/>
                    <select onChange={this.handleCardSet} value={this.state.cardset}>
                        <option value="ecommerce">E-Commerce</option>
                        <option value="eop">Elevation of Privilege</option>
                    </select><br/>
                    Your name: <br/>
                    <input value={this.state.userName} onChange={this.updateUsername}/><br/>
                    <button onClick={this.createProject} disabled={this.state.disableButton}>Create</button>
                    <br/>{this.state.errorMsg}
                </div>
            );
        }
    };
}

export default CreateJoinProject;
