import React from 'react';
import './App.css';
import Game from './game';
import { generateInitialState, reduce } from './reducers'

// const gameState = {
//   day: 3,
//   players: [1, 2],
//   cardsPlayed: ['pass', 'pass'],
//   player: 1,
//   role: 'Hitler',
// }

class App extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      gameState: generateInitialState(),
    };
  }

  doAction = ({type, data}) => {
    this.setState({
      gameState: reduce(this.state.gameState, type, data),
    })
  }

  render() {
    return (
      <Game id={0} gameState={this.state.gameState} doAction={this.doAction}></Game>
    );
  }
}

export default App;
