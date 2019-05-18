import React from 'react';
import './App.css';
import Game from './game';
import { generateInitialState, reduce } from 'shared/reducers'
import io from 'socket.io-client';
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

    this.socket = io('http://localhost:6060')
    this.socket.on('news', (data) => {
      console.log(data);
      this.socket.emit('my other event', { my: 'data' });
    });

    this.state = {
      gameState: generateInitialState(),
    };
  }

  doAction = ({type, data}) => {
    this.socket.emit('doAction', {type, data});
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
