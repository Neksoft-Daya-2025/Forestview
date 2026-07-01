import React from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import App from "./App.jsx";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <main style={{ padding: "2rem", fontFamily: "Arial, sans-serif", color: "#064324", maxWidth: 560 }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 600 }}>Page could not load</h1>
          <p style={{ lineHeight: 1.5 }}>
            Something went wrong in the app. Try refreshing. For local development, run{" "}
            <code>npm run dev</code> and open <a href="http://localhost:5173/">http://localhost:5173</a>.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{
              marginTop: 12,
              padding: "10px 20px",
              border: 0,
              borderRadius: 8,
              background: "#064324",
              color: "#fff",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Reload page
          </button>
        </main>
      );
    }
    return this.props.children;
  }
}

const rootEl = document.getElementById("root");
if (rootEl) {
  createRoot(rootEl).render(
    <ErrorBoundary>
      <App />
    </ErrorBoundary>,
  );
}
