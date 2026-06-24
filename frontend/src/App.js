import React, { useState, useRef, useEffect } from "react";
import "./App.css";
import LoginPage from "./LoginPage";
import RegisterPage from "./RegisterPage";

function App() {
  const [user, setUser] = useState(() => localStorage.getItem("user") || null);
  const [page, setPage] = useState(() =>
    localStorage.getItem("user") ? "home" : "login"
  );

  const [query, setQuery] = useState("");
  const [mode, setMode] = useState("Claude");
  const [showUploadMenu, setShowUploadMenu] = useState(false);
  const [showModeMenu, setShowModeMenu] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const uploadMenuRef = useRef(null);
  const modeMenuRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

    useEffect(() => {
  const handleClickOutside = (event) => {
    // Close Upload Menu
    if (
      uploadMenuRef.current &&
      !uploadMenuRef.current.contains(event.target)
    ) {
      setShowUploadMenu(false);
    }

    // Close Mode Menu
    if (
      modeMenuRef.current &&
      !modeMenuRef.current.contains(event.target)
    ) {
      setShowModeMenu(false);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  const handleSetUser = (newUser) => {
    setUser(newUser);

    if (newUser) {
      localStorage.setItem("user", newUser);
    } else {
      localStorage.removeItem("user");
    }
  };

  if (!user) {
    if (page === "register") {
      return <RegisterPage setPage={setPage} />;
    }

    return <LoginPage setPage={setPage} setUser={handleSetUser} />;
  }

  const handleAsk = async () => {
    if (!query.trim() && !selectedFile) return;

    const currentPrompt = query;
    const currentFile = selectedFile;

    setMessages((prev) => [
      ...prev,
      {
        type: "user",
        text: currentPrompt || `Attached file: ${currentFile?.name}`,
      },
    ]);

    setQuery("");
    setSelectedFile(null);
    setIsLoading(true);

    try {
      const formData = new FormData();

      formData.append("user_id", user || "guest");
      formData.append("prompt", currentPrompt || "Please understand the attached file");

      if (currentFile) {
        formData.append("attachment", currentFile);
      }

      const res = await fetch("http://localhost:5000/api/ask", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Backend error");
      }

      setMessages((prev) => [
        ...prev,
        {
          type: "bot",
          html: data.response_text || "No response received",
          attachment: data.saved_file_path,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          type: "bot",
          html: `<p style='color:red'>${err.message || "Failed to connect to server"}</p>`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestions = [
    "What is quantum computing?",
    "How does the human brain work?",
    "What's the latest in AI research?",
    "Explain black holes simply",
  ];  



  return (
    <div className="app">
      <header className="header">
        <div className="logo">⊕ Sightspectrum-AI</div>

        <nav>
          <button onClick={() => setPage("home")}>Home</button>
          <button>Discover</button>
          <button>Library</button>

          <button
            className="signin-btn"
            onClick={() => {
              handleSetUser(null);
              setPage("login");
            }}
          >
            {/* Sign Out ({user}) */}
            Sign Out
          </button>
        </nav>
      </header>

      <main className={messages.length === 0 ? "main" : "main main--chat"}>
        {messages.length === 0 && (
          <h1>
            Ask <span>anything.</span>
            <br />
            Get clear answers.
          </h1>
        )}

        {messages.length > 0 && (
          <div className="chat-container">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={msg.type === "user" ? "user-message" : "bot-message"}
              >
                {msg.type === "user" ? (
                  <p>{msg.text}</p>
                ) : (
                  <>
                    <div dangerouslySetInnerHTML={{ __html: msg.html }} />

                    {msg.attachment && (
                      <p className="attachment-link">
                        📎 Saved file: {msg.attachment}
                      </p>
                    )}
                  </>
                )}
              </div>
            ))}

            {isLoading && <div className="bot-message">Thinking...</div>}
            <div ref={chatEndRef} />
          </div>
        )}

        <div
          className={
            messages.length === 0
              ? "search-box"
              : "search-box search-box--sticky"
          }
        >
          <textarea
            placeholder="Ask anything..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleAsk();
              }
            }}
          />

          {selectedFile && (
            <div className="selected-file">
              📎 {selectedFile.name}
            </div>
          )}

          <div className="search-actions">
            <div ref={uploadMenuRef} className="dropdown-wrapper">
              <button
                className="plus-btn"
                onClick={() => setShowUploadMenu(!showUploadMenu)}
              >
                +
              </button>

              {showUploadMenu && (
                <div className="dropdown-menu upload-menu">
                  <div onClick={() => document.getElementById("imageInput").click()}>
                    🖼️ Image
                  </div>

                  <div onClick={() => document.getElementById("fileInput").click()}>
                    📄 File
                  </div>
                </div>
              )}

              <input
                id="imageInput"
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  setSelectedFile(e.target.files[0]);
                  setShowUploadMenu(false);
                }}
              />

              <input
                id="fileInput"
                type="file"
                hidden
                onChange={(e) => {
                  setSelectedFile(e.target.files[0]);
                  setShowUploadMenu(false);
                }}
              />
            </div>

            <div className="right-actions">
              <div ref={modeMenuRef} className="dropdown-wrapper">
                <button
                  className="mode-btn"
                  onClick={() => setShowModeMenu(!showModeMenu)}
                >
                  🌐 {mode}
                </button>

                {showModeMenu && (
                  <div className="dropdown-menu mode-menu">
                    <div
                      onClick={() => {
                        setMode("Claude");
                        setShowModeMenu(false);
                      }}
                    >
                      Claude
                    </div>

                    <div
                      onClick={() => {
                        setMode("Haiku 4.6");
                        setShowModeMenu(false);
                      }}
                    >
                      Haiku 4.6
                    </div>
                                <div
                      onClick={() => {
                        setMode("Sonnet 3.0");
                        setShowModeMenu(false);
                      }}
                    >
                      Sonnet 3.0
                    </div>
                  </div>
                )}
              </div>

              <button
                className="ask-btn"
                onClick={handleAsk}
                disabled={isLoading}
              >
                {isLoading ? "..." : "Ask →"}
              </button>
            </div>
          </div>
        </div>

        {messages.length === 0 && (
          <div className="suggestions">
            {suggestions.map((item) => (
              <div key={item} onClick={() => setQuery(item)}>
                {item}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;