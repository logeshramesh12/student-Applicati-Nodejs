import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const API = process.env.REACT_APP_API_BASE_URL;
  const navigate = useNavigate(); // ✅ IMPORTANT

  const handleLogin = async () => {
    const res = await fetch(`${API}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    console.log("LOGIN RESPONSE:", data); // debug

    if (res.ok) {
      // ✅ store token + role
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);

      // ✅ ROLE-BASED REDIRECT
     if (data.role === "teacher") {
  navigate("/teacher-dashboard");
} else {
  navigate("/student-form");
}

    } else {
      alert(data.message);
    }
  };

  return (
    <div>
      <input
        onChange={(e) => setUsername(e.target.value)}
        placeholder="username"
      />

      <input
        type="password"
        onChange={(e) => setPassword(e.target.value)}
        placeholder="password"
      />

      <button onClick={handleLogin}>Login</button>
    </div>
  );
}

export default Login;