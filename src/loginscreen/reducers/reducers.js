const initialState = {
  csrf: null,
  url: null,
};

//This is the AuthReducers

export default (state = initialState, action) => {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        csrf: action.csrf,
        url: action.url,
      };
    case 'LOGOUT':
      return {
        // or ...initialState,
        csrf: null,
        url: null,
      };

    default:
      return state;
  }
};
