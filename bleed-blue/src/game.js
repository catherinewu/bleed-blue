import React from 'react';

function Game(props) {
  return (
    <div>WELCOME TO SECRET HITLER, you are {props.gameState.player}
      <button onClick={()=>props.doAction({type: 'restart_game', data: { target: null } })}>click me to restart game</button>
      <button onClick={()=>props.doAction({type: 'play_vote', data: { target: 'B'}})}>click me to vote B</button>
      <button onClick={()=>props.doAction({type: 'play_vote', data: { target: 'C'}})}>click me to vote C</button>
      <button onClick={()=>props.doAction({type: 'reveal_outcome', data: { target: null, outcome: 'liberals win' }})}>click me to reveal outcome</button>
    </div>
  );
}

export default Game;
