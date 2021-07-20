import React, {Component} from 'react';
import Particles from 'react-particles-js';
import Clarifai from 'clarifai';
import Navigation from './components/Navigation/Navigation';
import SignIn from './components/SignIn/SignIn';
import Register from './components/Register/Register';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Rank from './components/Rank/Rank';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import './App.css';

const app = new Clarifai.App({
  apiKey: 'f1b5884dc6fc4c05a55ff6d04918547f'
});

const particlesOptions = {
  particles: {
    number: {
      value: 30,
      density: {
        enable: true,
        value_area: 400
      }
    }
  }
};

class App extends Component {
  constructor() {
    super();
    this.state = {
      input: '',
      imageUrl: '',
      box: [],
      route: 'signin', 
      isSignedIn: false
    };
  }

  calculateFaceLocation = (data) => {
    const detectData = data.outputs[0].data.regions;
    const image = document.getElementById('inputImage');
    const width = Number(image.width);
    const height = Number(image.height);
    const clarifaiFace = [];

    for (let i = 0; i < detectData.length; i++) {
      clarifaiFace.push({
        leftCol: detectData[i].region_info.bounding_box.left_col * width, 
        topRow: detectData[i].region_info.bounding_box.top_row * height,
        rightCol: width - (detectData[i].region_info.bounding_box.right_col * width), 
        bottomRow: height - (detectData[i].region_info.bounding_box.bottom_row * height)
      })
    }

    return clarifaiFace;
  }

  displayFaceBox = (box) => {
    this.setState({box: box});
  }

  onInputChange = (event) => {
    this.setState({input: event.target.value});
  }

  onButtonSubmit = () => {
    this.setState({imageUrl: this.state.input})
    app.models
      .predict(
        Clarifai.FACE_DETECT_MODEL, 
        this.state.input)
      .then(response => this.displayFaceBox(this.calculateFaceLocation(response)))
      .catch(err => console.log(err));
  }

  onRouteChange = (route) => {
    this.setState({route: route});
    if (route === 'signout') {
      this.setState({isSignedIn: false});
    } else if (route === 'home') {
      this.setState({isSignedIn: true});
    }
  }

  render() {
    const { isSignedIn, imageUrl, route, box } = this.state;
    return (
      <div className="App">
        <Particles 
          className="particles" 
          params={particlesOptions} 
        />
        <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange}/>
        { route === 'home' ?
            <div>
              <Logo />
              <Rank />
              <ImageLinkForm 
                onInputChange={this.onInputChange} 
                onButtonSubmit={this.onButtonSubmit}
              />
              <FaceRecognition box={box} imageUrl={imageUrl} />
            </div> :
            (
              route === 'signin' || route === 'signout' ?
                <SignIn onRouteChange={this.onRouteChange} /> : 
                <Register onRouteChange={this.onRouteChange} />
            )
        }
      </div>
    );
  }
}

export default App;