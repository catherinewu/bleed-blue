import _ from 'lodash';

const hitler = 'B';
export const generateInitialState = () => {
  return {
    players: [
      {
        name: 'A',
        role: 'Voter',
        hasChosen: false,

      },
      {
        name: 'B',
        role: 'Candidate',
        chosen: false,

      },
      {
        name: 'C',
        role: 'Candidate',
        chosen: false,
      },
    ],
    status: 'pending',
    uid: 0,
  };
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