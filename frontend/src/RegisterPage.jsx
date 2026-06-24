import React, { useState } from "react";
import "./RegisterPage.css";

function RegisterPage({ setPage }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleRegister = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch("http://localhost:5000/api/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ User_ID: email, Password: password }),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess("Account created successfully! Redirecting to sign in...");
                setEmail("");
                setPassword("");
                setConfirmPassword("");
                setTimeout(() => {
                    setPage("login");
                }, 2000);
            } else {
                setError(data.message || "Failed to register");
            }
        } catch (err) {
            setError("Error connecting to server");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="register-page">
            <header className="header">
                <div className="logo">⊕ Sightspectrum-AI</div>

                <nav>
                    <button className="signin-btn" onClick={() => setPage("login")}>Sign In</button>
                </nav>
            </header>

            <div className="register-card">
                <div className="user-icon">👤</div>

                <h2>Create account</h2>
                <p>Sign up for a free Sightspectrum-AI account</p>

                {error && <p className="error-msg">{error}</p>}
                {success && <p className="success-msg">{success}</p>}

                <form onSubmit={handleRegister}>
                    <label>Email address</label>
                    <input 
                        type="email" 
                        placeholder="you@example.com" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isLoading}
                    />

                    <label>Password</label>
                    <input 
                        type="password" 
                        placeholder="••••••••" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={isLoading}
                    />

                    <label>Confirm Password</label>
                    <input 
                        type="password" 
                        placeholder="••••••••" 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        disabled={isLoading}
                    />

                    <button type="submit" className="register-btn" disabled={isLoading}>
                        {isLoading ? "Creating Account..." : "Sign up →"}
                    </button>
                </form>

                <p className="login-text">
                    Already have an account? <span className="login-link" onClick={() => setPage("login")}>Sign In</span>
                </p>
            </div>
        </div>
    );
}

export default RegisterPage;
