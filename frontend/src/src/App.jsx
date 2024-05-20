import { useState, useEffect } from "react";
import "./App.css";
import icon from "./assets/icon.png";

function App() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("login");
  const [token, setToken] = useState("");
  const [messages, setMessages] = useState([]);
  const [recipients, setRecipients] = useState([]);
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(
          "http://localhost:3001/api/messages/retrieve",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const responseData = await response.json();
        setMessages(responseData);
        const uniqueRecipients = [
          ...new Set(responseData.map((message) => message.sender)),
        ];
        setRecipients(uniqueRecipients);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    if (token) {
      fetchMessages();
    }
  }, [token]);

  const handleLogin = async (e) => {
    e.preventDefault();
    const data = { email, password };

    try {
      const response = await fetch("http://localhost:3001/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      const responseData = await response.json();
      const token = responseData.token;

      // Display token in a popup window
      console.log(`Token: ${token}`);

      setToken(token);
    } catch (error) {
      console.error("Error logging in:", error);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const data = { username, email, password };

    try {
      const response = await fetch("http://localhost:3001/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      const responseData = await response.json();
      console.log(responseData);
    } catch (error) {
      console.error("Error registering:", error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim()) return;

    try {
      const response = await fetch("http://localhost:3001/api/messages/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          recipient: selectedRecipient,
          content: newMessage,
        }),
      });
      const responseData = await response.json();
      console.log(responseData);
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleRecipientClick = (recipient) => {
    setSelectedRecipient(recipient);
  };

  const handleNewChatSubmit = (e) => {
    e.preventDefault();
    if (username.trim() && newMessage.trim()) {
      // Save recipient for future
      setRecipients((prevRecipients) => [...prevRecipients, username]);
      setSelectedRecipient(username);
    }
  };

  return (
    <div className="App">
      <header className="header">
        <div className="header-left">
          <img src={icon} alt="Icon" />
        </div>
        <div className="header-center">
          <h1>User Auth using SocketProgramming</h1>
        </div>
        <div className="header-right">
          {token && (
            <button className="logout-button" onClick={() => setToken("")}>
              Logout
            </button>
          )}
        </div>
      </header>
      <main>
        {token ? (
          <div className="chat-container">
            <div className="sidebar">
              <h2>Recipients</h2>
              {recipients.map((recipient, index) => (
                <button
                  key={index}
                  onClick={() => handleRecipientClick(recipient)}
                  className={selectedRecipient === recipient ? "selected" : ""}
                >
                  {recipient}
                </button>
              ))}
              <button onClick={() => setSelectedRecipient(null)} className="new-chat-button">
                New Chat
              </button>
            </div>
            <div className="messages-container">
              {selectedRecipient ? (
                <>
                  <h2>Messages with {selectedRecipient}</h2>
                  <ul>
                    {messages
                      .filter(
                        (message) =>
                          message.sender === selectedRecipient ||
                          message.recipient === selectedRecipient
                      )
                      .map((message, index) => (
                        <li key={index}>
                          <strong>
                            {message.sender === username
                              ? "You"
                              : message.sender}
                            :
                          </strong>{" "}
                          {message.content}
                        </li>
                      ))}
                  </ul>
                  <form onSubmit={handleSendMessage}>
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="message-input"
                    />
                    <button type="submit" className="send-button">
                      Send
                    </button>
                  </form>
                </>
              ) : (
                <form onSubmit={handleNewChatSubmit} className="new-chat-form">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Recipient username"
                    required
                  />
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    required
                  />
                  <button type="submit">Send</button>
                </form>
              )}
            </div>
          </div>
        ) : (
          <div className="login-container">
            <h2>{mode === "login" ? "Login" : "Register"}</h2>
            <form
              className="login-form"
              onSubmit={mode === "login" ? handleLogin : handleRegister}
            >
              {mode === "register" && (
                <div>
                  <label htmlFor="username">Username:</label>
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              )}
              <div>
                <label htmlFor="email">Email:</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="password">Password:</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <button type="submit">
                {mode === "login" ? "Login" : "Register"}
              </button>
              <p>
                {mode === "login" ? "New user?" : "Already have an account?"}{" "}
                <button
                  onClick={() =>
                    setMode(mode === "login" ? "register" : "login")
                  }
                >
                  {mode === "login" ? "Register" : "Login"}
                </button>
              </p>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
