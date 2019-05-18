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
  console.log('in reduce with game state', JSON.stringify(gameState, null, 4));
  const { target, source, outcome } = data;
  console.log('target is', target);
  const handler = reducers[type];
  return handler(gameState, { target, source, outcome });
}

const reducers = {
  play_vote(state, { target }) {
    console.log('state is', JSON.stringify(state, null, 4));
    _.map(state.players, (p) => {
      console.log('p', JSON.stringify(p, null, 4));
      if (p.role === 'Voter') {
        p.hasChosen = true;
      }
      else if (p.name === target) {
        p.chosen = true;
        if (p.name !== hitler) {
          state.outcome = 'liberal'; // did not pick hitler!
        } else {
          state.outcome = 'fascist'
        }
      }
      else {
        p.chosen = false;
      }
    });
    console.log(`state.players`, JSON.stringify(state.players, null, 4));
    // state.status = 'finalizing';
    return {
      ...state,
      status: 'finalizing',
    };
  },

  restart_game(state, { target }) {
    return generateInitialState();
  },
  // server events

  // outcome: one of 'fascist victory' or 'liberal victory'
  reveal_outcome(state, { outcome }) {
    return {
      ...state,
      status: 'completed',
      outcome,
    }
  }
};