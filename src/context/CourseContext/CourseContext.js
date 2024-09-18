import { createContext, useReducer } from "react";

export const CourseContext = createContext();

export const coursesReducer = (state, action) => {
  switch (action.type) {
    case 'SET_COURSES':
      return {
        courses: action.payload,
      };
    case 'CREATE_COURSE':
      return {
        courses: [action.payload, ...state.courses],
      };
    default:
      return state;
  }
};

export const CourseContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(coursesReducer, {
    courses: [], 
  });

  return (
    <CourseContext.Provider value={{ ...state, dispatch }}>
      {children}
    </CourseContext.Provider>
  );
};
