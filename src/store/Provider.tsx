"use client";

import { Provider } from "react-redux";
import { store, persistor } from "./index";
import React, { useEffect } from "react";
import { PersistGate } from "redux-persist/integration/react"; // Import PersistGate
import { useDispatch } from "react-redux";
import { initFromStorage } from "./reducers/authSlice";

function AuthBootstrap({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(initFromStorage());
  }, [dispatch]);

  return <>{children}</>;
}

function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AuthBootstrap>{children}</AuthBootstrap>
      </PersistGate>
    </Provider>
  );
}

export default Providers;
