const _ = require('lodash');

const hitler = 'B';

const generateInitialState = (targetNumberPlayers) => {
  console.log('in shared/reducers -> generateInitialState');
  return {
    players: [
      // {
      //   name: 'A',
      //   role: 'Voter',
      //   hasChosen: false,
      //   playerId: 0,
      // },
      // {
      //   name: 'B',
      //   role: 'Candidate',
      //   chosen: false,
      //   playerId: 1,
      // },
      // {
      //   name: 'C',
      //   role: 'Candidate',
      //   chosen: false,
      //   playerId: 2,
      // },
    ],
    status: 'pending',
    targetNumberPlayers: targetNumberPlayers,
  };
};

const validate = (gameState, playerId, type, data) => {
  const { target, source, outcome } = data;
  const handler = validators[type];
  if (!handler) {
    console.error('Unsupported event type', type);
    return false;
  }
  return handler(gameState, playerId, { target, source, outcome });
};

const validators = {
  play_vote(state, playerId, { target }) {
    return state.status === 'pending' && _.get(_.findLast(_.get(state, 'players'), (p) => p.playerId === playerId), 'playerRole') === 'Voter'
      && _.get(_.findLast(_.get(state, 'players'), (p) => p.playerId === target), 'playerRole') === 'Candidate';
  },

  restart_game(state, playerId) {
    console.log('in validate restart_game');
    // XXX too permissive
    // TODO add "game leader" or something
    return true;
  },

  reveal_outcome(state, playerId, { outcome }) {
    console.log('in validate reveal_outcome');
    // Only the moderator (playerId = -1) can reveal the outcome of the game
    return state.status === 'finalizing' && playerId === -1;
  }
};


const reduce = (gameState, playerId, type, data) => {
  const { target, source, outcome, newPlayer } = data;
  const handler = reducers[type];
  return handler(gameState, { target, source, outcome, newPlayer });
}

const reducers = {
  play_vote(state, { target }) {
    console.log('in reduce: play_vote with target, ', target);
    const players = _.map(state.players, (p) => {
      return {
        ...p,
        hasChosen: p.playerRole === 'Voter',
        chosen: p.playerId === target,
      }
    });
    return {
      ...state,
      players,
      status: 'finalizing',
    };
  },

  restart_game(state, { target }) {
    console.log('in reduce: restart_game');
    return generateInitialState(3);
  },

  // outcome: one of 'fascist victory' or 'liberal victory'
  reveal_outcome(state, { outcome }) {
    console.log('in reduce: reveal_outcome');
    return {
      ...state,
      status: 'completed',
      outcome,
    }
  },

  add_player(state, { newPlayer }) {
    console.log('in reduce: add_player');
    const players = _.cloneDeep(state.players);
    players.push(newPlayer);
    return {
      ...state,
      players,
    };
  },

  assign_roles(state) {
    console.log('in reduce: assign_roles');
    const players = _.map(state.players, (p) => {
      return {
        ...p,
        playerRole: p.playerId === 1 ? 'Voter' : 'Candidate'
      }
    });
    return {
      ...state,
      players,
    }
  }
};

exports.reduce = reduce;
exports.validate = validate;
exports.generateInitialState = generateInitialState;
