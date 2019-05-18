import React from 'react';
import './game.css';
import _ from 'lodash';

// TODO move to player.js
function Player({playerState: { role, chosen, name }, onNominate}) {
  return (
    <div className="player">
      <span className="player--info">
        <span className="player--name">{name}</span>
        <span className="player--role">({role})</span>
        <span className="player--chosen">{chosen ? ' has been chosen' : ' would like to be chosen'}</span>
      </span>
      <div className="player--actions">
        <div className="action--button">
          Nominate
        </div>
      </div>
    </div>
  );
}

/*
<button onClick={()=>props.doAction({type: 'restart_game', data: { target: null } })}>click me to restart game</button>
      <button onClick={()=>props.doAction({type: 'play_vote', data: { target: 'B'}})}>click me to vote B</button>
      <button onClick={()=>props.doAction({type: 'play_vote', data: { target: 'C'}})}>click me to vote C</button>
      <button onClick={()=>props.doAction({type: 'reveal_outcome', data: { target: null, outcome: 'liberals win' }})}>click me to reveal outcome</button>

*/

function Game({gameState: { uid, players }}) {
  console.log(uid, players);
  const player = players[uid];
  const { role } = player;
  const status = 'Day 1';
  return (
    <div className="game--container">
      <div className="header">
        <span>
          <span className="header--secret">SECRET</span>
          {' '}
          HITLER
        </span>
      </div>

      <div className="game">

        <div className="user--info">
          You are a <strong>{role}</strong>.
        </div>

        <div className="state--info">
          Game status: { status }
        </div>

        <div className="players--info">
          {_.map(players, player => (
            <Player key={player.uid} playerState={player}/>
          ))}
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