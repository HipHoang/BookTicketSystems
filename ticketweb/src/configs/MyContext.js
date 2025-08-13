import { createContext, useReducer } from 'react';

const initialState = {
  user: null,
  token: null,
  reservations: [],
  companies: [],
  buses: [],
  schedules: [],
  promotions: [],
  notifications: [],
  chatMessages: [],
};

export const MyContext = createContext(initialState);

const reducer = (state, action) => {
  switch(action.type) {
    case 'SET_USER':
      return {...state, user: action.payload.user, token: action.payload.token};
    case 'LOGOUT':
      return {...state, user: null, token: null};
    case 'SET_COMPANIES':
      return {...state, companies: action.payload};
    case 'SET_BUSES':
      return {...state, buses: action.payload};
    case 'SET_SCHEDULES':
      return {...state, schedules: action.payload};
    case 'SET_RESERVATIONS':
      return {...state, reservations: action.payload};
    case 'ADD_RESERVATION':
      return {...state, reservations: [...state.reservations, action.payload]};
    case 'SET_PROMOTIONS':
      return {...state, promotions: action.payload};
    case 'SET_NOTIFICATIONS':
      return {...state, notifications: action.payload};
    case 'SET_CHAT_MESSAGES':
      return {...state, chatMessages: action.payload};
    default:
      return state;
  }
};

export const MyProvider = ({children}) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <MyContext.Provider value={{state, dispatch}}>
      {children}
    </MyContext.Provider>
  );
};
