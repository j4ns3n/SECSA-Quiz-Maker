import { createContext, useReducer } from "react";

export const ExamContext = createContext();

export const examReducer = (state, action) => {
  switch (action.type) {
    case 'SET_EXAM':
      return {
        exams: action.payload,
      };
    case 'CREATE_EXAM':
      return {
        exams: [action.payload, ...state.exams],
      };
    case 'DELETE_EXAM':
      return {
        exams: state.exams.filter(exam => exam._id !== action.payload),
      };
    default:
      return state;
  }
};


export const ExamContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(examReducer, {
    exams: [], 
  });

  return (
    <ExamContext.Provider value={{ ...state, dispatch }}>
      {children}
    </ExamContext.Provider>
  );
};
