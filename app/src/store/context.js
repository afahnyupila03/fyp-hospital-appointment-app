"use client";

import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";
import React, { useContext, useEffect, useReducer } from "react";

export const CONSTANTS = {
  SIGN_UP: "SIGN_UP",
  SIGN_IN: "SIGN_IN",
  SIGN_OUT: "SIGN_OUT",
  ERROR: "ERROR",
  SET_USER: "SET_USER",
  SET_LOADING: "SET_LOADING",
};

export const Context = React.createContext();

export const defaultAppState = {
  user: null,
  error: null,
  loading: true,
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

    case CONSTANTS.SET_LOADING:
      return {
        ...state,
        loading: action.payload.loading,
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
  const router = useRouter();

  const getApiUrl = (role, endpoint) =>
    `http://localhost:4000/${role}/${endpoint}`;

  useEffect(() => {
    const role = localStorage.getItem("role");
    const token = localStorage.getItem("token");

    if (token) {
      getCurrentUser();
    } else if (role) {
        router.replace(`/${role}/auth`);
      }

    // if (!isAuthenticated()) {
    //   if (role) {
    //     router.replace(`/${role}/auth`);
    //   } else {
    //     getCurrentUser();
    //   }
    // }
  }, []);

  //   Fetch current user info from express backend (via token in localStorage)
  const getCurrentUser = async () => {
    try {
      const token = localStorage.getItem("token");
      const role = localStorage.getItem("role");
      if (!token) throw new Error("No authenticated token found");

      const res = await fetch(getApiUrl(role, "me"), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const data = await res.json();

        if (res.status === 403) {
          localStorage.removeItem("token");
          // localStorage.removeItem("role");
          dispatch({ type: CONSTANTS.SIGN_OUT });
        }

        throw new Error(data.message || "Failed to fetch current user");
      }

      const data = await res.json();
      let user;
      switch (role) {
        case "admin":
          user = data.admin;
          break;
        case "doctor":
          user = data.doctor;
          break;
        case "patient":
          user = data.patient;
          break;
        default:
          throw new Error("unknown user role");
      }

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

      const { token } = data;
      let { userData } = data;
      // let userData;
      switch (role) {
        case "admin":
          userData = data.admin;
          break;
        case "doctor":
          userData = data.doctor;
          break;
        case "patient":
          userData = data.patient;
          break;
        default:
          break;
      }

      localStorage.setItem("token", token);
      localStorage.setItem("role", role);

      dispatch({
        type: CONSTANTS.SIGN_UP,
        payload: { user: userData },
      });

      return userData;
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
      console.log("sign-in route: ", getApiUrl(role, "login"));
      const res = await fetch(getApiUrl(role, "login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      console.log("context signin res: ", res);

      const data = await res.json();
      console.log("context data: ", data);
      if (!res.ok) throw new Error(data.message);

      const { token } = data;
      let { userData } = data;
      // let userData;
      switch (role) {
        case "admin":
          userData = data.admin;
          break;
        case "doctor":
          userData = data.doctor;
          break;
        case "patient":
          userData = data.patient;
          break;
        default:
          break;
      }
      console.log("user data context: ", userData);

      localStorage.setItem("token", token);
      localStorage.setItem("role", role);

      dispatch({
        type: CONSTANTS.SIGN_IN,
        payload: { user: userData },
      });

      return userData;
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

      await fetch(getApiUrl(role, "logout"), {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      //   Clear token + role client-side
      localStorage.removeItem("token", token);
      // localStorage.removeItem("role");

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

  const isAuthenticated = () => {
    const token = localStorage.getItem("token");
    // const role = localStorage.getItem("role");

    if (!token) return false;

    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;

      // Check token expiry
      if (decoded.exp < currentTime) {
        // Token expired clean up
        localStorage.removeItem("token");
        // localStorage.removeItem("role");

        // dispatch({ type: CONSTANTS.SIGN_OUT });

        return false;
      }

      return true;
    } catch (error) {
      // Token invalid or error decoding
      localStorage.removeItem("token");
      // localStorage.removeItem("role");

      // dispatch({ type: CONSTANTS.SIGN_OUT });

      return false;
    }

    // return Boolean(token && role);
  };

  const value = {
    user: state.user,
    error: state.error,
    isAuthenticated,
    signupHandler,
    signinHandler,
    signoutHandler,
  };

  return <Context.Provider value={value}>{children}</Context.Provider>;
};

export const AppState = () => useContext(Context);
