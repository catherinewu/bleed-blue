import React from 'react';
import './game.css';
import _ from 'lodash';

// TODO move to player.js
function Player({ uid, playerState, doAction }) {
  return (
    <div className="player">
      <span className="player--info">
        {/* <span className="player--name">{name}</span> */}
        <span className="player--role">({ playerState.playerRole })</span>
        <span className="player--chosen">{ playerState.chosen ? ' has been chosen' : ' would like to be chosen'}</span>
      </span>
      <div className="player--actions">
        <div className="action--button">
          <button onClick={()=>doAction({type: 'play_vote', playerId: uid, data: { target: playerState.playerId } })}>click to nominate { playerState.playerId }</button>
        </div>
      </div>
    </div>
  );
}
function Game({id, gameState, playerId, doAction, history}) {
  const player = _.findLast(gameState.players, (p) => p.playerId === playerId);

  const role = player.playerRole;
  const status = 'Day 1';
  return (
    <div className="game--container">
      <div className="header">
        <span>
          <span className="header--secret">SECRET</span>
          {' '}
          H
        </span>
      </div>

      <div className="game">

        <div className="user--info">
          You are a <strong>{role}</strong>.
        </div>

        <div className="state--info">
          Game status: { status }
        </div>

        <div className="state--info">
          Game id: { id }
        </div>

        <div className="state--info">
          Number Players { gameState.players.length } of { gameState.targetNumberPlayers}
        </div>

        <div className="players--info">
          {_.map(gameState.players, player => (
            <Player uid={playerId} playerState={player} doAction={doAction}/>
          ))}
        </div>

        <div className="action--button">
            <button onClick={()=>doAction({type: 'reveal_outcome', playerId, data: { target: null, outcome: 'liberals win'} })}> click to reveal outcome </button>
        </div>
        <div className="action--button">
            <button onClick={()=>history('view')}> click to reveal game history </button>
        </div>
        <div className="action--button">
            <button onClick={()=>history('clear')}> click to clear game history </button>
        </div>
        <div className="action--info">
          <div className="action--pending">
            You need to <strong>nominate a player</strong>
          </div>
            Your selected action: None
        </div>
      </div>
    </div>
  );
}

export default Game;