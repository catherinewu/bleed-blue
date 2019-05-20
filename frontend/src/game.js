import React from 'react';
import './game.css';
import _ from 'lodash';

// TODO move to player.js
function Player({playerState: { role, chosen, name }, onNominate, doAction, actorUid}) {
  return (
    <div className="player">
      <span className="player--info">
        <span className="player--name">{name}</span>
        <span className="player--role">({role})</span>
        <span className="player--chosen">{chosen ? ' has been chosen' : ' would like to be chosen'}</span>
      </span>
      <div className="player--actions">
        <div className="action--button">
          <button onClick={()=>doAction({type: 'play_vote', actorUid, data: { target: name } })}>click to nominate {name}</button>
        </div>
      </div>
    </div>
  );
}

function Game({gameState: { uid, players }, doAction, history}) {
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

        <div className="players--info">
          {_.map(players, player => (
            <Player key={player.uid} actorUid={uid} playerState={player} doAction={doAction}/>
          ))}
        </div>

        <div className="action--button">
            <button onClick={()=>doAction({type: 'reveal_outcome', actorUid: uid, data: { target: null, outcome: 'liberals win'} })}> click to reveal outcome </button>
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