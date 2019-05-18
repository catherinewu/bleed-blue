import React from 'react';

function Game(props) {
  return (
    <div>WELCOME TO SECRET HITLER, you are {props.gameState.player}
      <button onClick={()=>props.doAction({type: 'play_vote', data: 'liberal'})}>click me!</button>
    </div>
  );
}

export default Game;
