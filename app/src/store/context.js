"use client";

import axios from "axios";
import React, { useContext, useEffect, useReducer } from "react";

export const CONSTANTS = {
  SIGN_UP: "SIGN_UP",
  SIGN_IN: "SIGN_IN",
  SIGN_OUT: "SIGN_OUT",
  ERROR: "ERROR",
  SET_USER: "SET_USER",
};

export const Context = React.createContext();

export const defaultAppState = {
  user: null,
  error: null,
};

export const AppReducer = (state, action) => {
  switch (action.type) {
    case CONSTANTS.SIGN_UP:
    case CONSTANTS.SIGN_IN:
    case CONSTANTS.SET_USER:
      return {
        ...state,
        user: action.payload.user,
        error: null,
      };

    case CONSTANTS.SIGN_OUT:
      return { ...state, user: null, error: null };
    case CONSTANTS.ERROR:
      return {
        ...state,
        error: action.payload.error,
      };

    default:
      return state;
  }
};

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(AppReducer, defaultAppState);

  const getApiUrl = (role, endpoint) =>
    `http://localhost:4000/${role}/${endpoint}`;

  useEffect(() => {
    getCurrentUser();
  }, []);

  //   Fetch current user info from express backend (via token in localStorage)
  const getCurrentUser = async () => {
    try {
      const token = localStorage.getItem("token");
      const role = localStorage.getItem("role");
      if (!token || !role) throw new Error("No authenticated token found");

      const res = await fetch(getApiUrl(role, "/me"), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to fetch current user");
      }

      const data = await res.json();
      const user = data.user;

      dispatch({ type: CONSTANTS.SET_USER, payload: { user } });

      return user;
    } catch (error) {
      dispatch({
        type: CONSTANTS.ERROR,
        payload: {
          error: error.message,
        },
      });
      throw error;
    }
  };

  const signupHandler = async (formData, role) => {
    try {
      const res = await fetch(getApiUrl(role, "register"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      const { token, user } = data;

      localStorage.setItem("token", token);
      localStorage.setItem("role", role);

      dispatch({
        type: CONSTANTS.SIGN_UP,
        payload: { user },
      });

      return user;
    } catch (error) {
      dispatch({
        type: CONSTANTS.ERROR,
        payload: { error: error.message },
      });
      throw error;
    }
  };

  const signinHandler = async (email, password, role) => {
    try {
      const res = await fetch(getApiUrl(role, "login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      const { token, user } = data;

      localStorage.setItem("token", token);
      localStorage.setItem("role", role);

      dispatch({
        type: CONSTANTS.SIGN_IN,
        payload: { user },
      });

      return user;
    } catch (error) {
      dispatch({
        type: CONSTANTS.ERROR,
        payload: { error: error.message },
      });
      throw error;
    }
  };

  const signoutHandler = async (role) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authenticated token found");

      const res = await fetch(getApiUrl(role, "logout"), {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      //   Clear token + role client-side
      localStorage.removeItem("token", token);
      localStorage.removeItem("role");

      //   Update app state
      dispatch({
        type: CONSTANTS.SIGN_OUT,
      });

      return user;
    } catch (error) {
      dispatch({
        type: CONSTANTS.ERROR,
        payload: {
          error: error?.message || "An error occurred while signing out",
        },
      });
      throw error;
    }
  };

  const value = {
    user: state.user,
    error: state.error,
    signupHandler,
    signinHandler,
    signoutHandler,
  };

  return <Context.Provider value={value}>{children}</Context.Provider>;
};

export const AppState = () => useContext(Context);
