const _ = require('lodash');

const hitler = 'B';

const generateInitialState = () => {
  console.log('in shared/reducers -> generateInitialState');
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
    uid: 0,
  };
};

const validate = (gameState, actorUid, type, data) => {
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
    console.log('in validate play_vote');
    return state.status === 'pending' && _.get(_.findLast(_.get(state, 'players'), (p) => p.uid === actorUid), 'role') === 'Voter'
      && _.get(_.findLast(_.get(state, 'players'), (p) => p.name === target), 'role') === 'Candidate';
  },

  restart_game(state, actorUid) {
    console.log('in validate restart_game');
    // XXX too permissive
    // TODO add "game leader" or something
    return true;
  },

  reveal_outcome(state, actorUid, { outcome }) {
    console.log('in validate reveal_outcome');
    // Only the moderator (uid = -1) can reveal the outcome of the game
    return state.status === 'finalizing' && actorUid === -1;
  }
};


const reduce = (gameState, actorUid, type, data) => {
  console.log('in reduce with game state ', gameState, ' and target ', data.target);
  const { target, source, outcome } = data;
  const handler = reducers[type];
  return handler(gameState, { target, source, outcome });
}

const reducers = {
  play_vote(state, { target }) {
    console.log('in play_vote');
    const players = _.map(state.players, (p) => {
      return {
        ...p,
        hasChosen: p.role === 'Voter',
        chosen: p.name === target,
      }
    });
    const toReturn = {
      ...state,
      players,
      status: 'finalizing',
    };
    return toReturn;
  },

  restart_game(state, { target }) {
    console.log('in restart_game');
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

exports.reduce = reduce;
exports.validate = validate;
exports.generateInitialState = generateInitialState;
