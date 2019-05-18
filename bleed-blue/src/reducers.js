const generateInitialState = () => {
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
  };
};

const reducers = {
  play_vote(state, { target }) {
    return {
      ...state,
      status: 'finalizing',
    };
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