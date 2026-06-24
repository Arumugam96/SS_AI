import React, { useState } from "react";
import "./LoginPage.css";

function LoginPage({ setPage, setUser }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const response = await fetch("http://localhost:5000/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ User_ID: email, Password: password }),
            });

            const data = await response.json();

            if (data.status === "Legitimate") {
                setUser(email);
                setPage("home");
            } else {
                setError("Invalid credentials");
            }
        } catch (err) {
            setError("Error connecting to server");
        }
    };
    return (
        <div className="login-page">
            <header className="header">
                <div className="logo">⊕ Sightspectrum-AI</div>

                <nav>
                    <button className="signin-btn">Sign In</button>
                </nav>
            </header>

            <div className="login-card">
                <div className="lock-icon">🔒</div>

                <h2>Welcome back</h2>
                <p>Sign in to your Sightspectrum account</p>

                {error && <p className="error-msg" style={{ color: "red", textAlign: "center" }}>{error}</p>}
                <form onSubmit={handleLogin}>
                    <label>Email address</label>
                    <input 
                        type="email" 
                        placeholder="you@example.com" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <div className="password-row">
                        <label>Password</label>
                        <a href="/">Forgot password?</a>
                    </div>

                    <input 
                        type="password" 
                        placeholder="••••••••" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <button type="submit" className="login-btn">Sign in →</button>
                </form>

                <div className="divider">
                    <span></span>
                    <p>or</p>
                    <span></span>
                </div>

                <button className="google-btn">G Continue with Google</button>

                <p className="signup-text">
                    Don’t have an account? <a href="/register" onClick={(e) => { e.preventDefault(); setPage("register"); }}>Sign Up free</a>
                </p>
            </div>
        </div>
    );
}

export default LoginPage;