import _ from 'lodash';

const hitler = 'B';
export const generateInitialState = () => {
  return {
    players: [
      {
        name: 'A',
        role: 'Voter',
        hasChosen: false,
        uid: 0,
      },
      {
        name: 'B',
        role: 'Candidate',
        chosen: false,
        uid: 1,
      },
      {
        name: 'C',
        role: 'Candidate',
        chosen: false,
        uid: 2,
      },
    ],
    status: 'pending',
  };
};

export const validate = (gameState, type, actorUid, data) => {
  const { target, source, outcome } = data;
  const handler = validators[type];
  if (!handler) {
    console.error('Unsupported event type', type);
    return false;
  }
  return handler(gameState, actorUid, { target, source, outcome });
};

const validators = {
  play_vote(state, actorUid, { target }) {
    return state.status === 'pending' && _.get(actorUid, 'players', actorUid, 'role') === 'Voter';
  },

  restart_game(state, actorUid) {
    // XXX too permissive
    // TODO add "game leader" or something
    return true;
  },

  reveal_outcome(state, actorUid, { outcome }) {
    // Only the moderator (uid = -1) can reveal the outcome of the game
    return state.status === 'finalizing' && actorUid === -1;
  }
};


export const reduce = (gameState, type, data) => {
  console.log('in reduce with game state', gameState);
  const { target, source, outcome } = data;
  console.log('target is', target);
  const handler = reducers[type];
  return handler(gameState, { target, source, outcome });
}

const reducers = {
  play_vote(state, { target }) {
    console.log('state is', state);
    const players = _.forEach(state.players, (p) => {
      return {
        ...p,
        hasChosen: p.role === 'Voter',
        chosen: p.name === target,
      }
    });
    console.log(`state.players`, JSON.stringify(state.players, null, 4));
    return {
      ...state,
      players,
      status: 'finalizing',
    };
  },

  restart_game(state, { target }) {
    return generateInitialState();
  },
  // server events

  // outcome: one of 'fascist victory' or 'liberal victory'
  reveal_outcome(state, { outcome }) {
    console.log('in reveal_outcome');
    return {
      ...state,
      status: 'completed',
      outcome,
    }
  }
};