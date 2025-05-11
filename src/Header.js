import React from "react";
import { useAuth } from "./AuthProvider";

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <div style={{ textAlign: "right", padding: "1rem" }}>
      {user && (
        <>
          <span>Logged in as {user.email}</span>
          <button onClick={logout} style={{ marginLeft: "1rem" }}>Logout</button>
        </>
      )}
    </div>
  );
}
