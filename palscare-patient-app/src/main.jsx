import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { Auth0Provider } from "@auth0/auth0-react";

createRoot(document.getElementById("root")).render(
  <Auth0Provider
    domain="dev-z6gzatrmm3mxqq8d.us.auth0.com"
    clientId="dbVCnKpa1bd9ivrLLg3ROdhA00Xc1EsB"
    authorizationParams={{
      redirect_uri: window.location.origin + "/login",
      audience: "https://dev-z6gzatrmm3mxqq8d.us.auth0.com/api/v2/"
    }}
  >
    <App />
  </Auth0Provider>
);
