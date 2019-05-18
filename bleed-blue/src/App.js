import React from 'react';
import logo from './logo.svg';
import './App.css';
import Game from './game';

const eventLog = [];

const gameState = {
  day: 3,
  players: [1, 2],
  cardsPlayed: ['pass', 'pass'],
  player: 1,
  role: 'Hitler',
}
// function App() {
//   return <Game id='adsfae' gameState={gameState} doAction={doAction}></Game>;
// }
class App extends React.Component {
  constructor(props){
    super(props);
    this.state = {count: 0};
  }
  render() {
    return (
      <Game id='adsfae' gameState={gameState} doAction={doAction}></Game>
    );
  }
}

function doAction({type, data}) {
  console.log('type', type);
  console.log('data', data);
}

export default App;
