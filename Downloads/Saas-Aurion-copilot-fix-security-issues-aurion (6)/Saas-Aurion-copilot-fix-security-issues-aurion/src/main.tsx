import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { ClerkProvider } from '@clerk/clerk-react';

const basename = import.meta.env.BASE_URL;

// Get the Clerk publishable key - HARDCODÉ POUR PRODUCTION
const clerkPubKey = 'pk_test_YXNzdXJlZC1zYWxtb24tMzkuY2xlcmsuYWNjb3VudHMuZGV2JA';

ReactDOM.createRoot(document.getElementById("root")!).render(
  <ClerkProvider publishableKey={clerkPubKey}>
    <BrowserRouter basename={basename}>
      <App />
    </BrowserRouter>
  </ClerkProvider>,
);