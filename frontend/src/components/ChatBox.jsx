import React, { useState } from "react";

const ChatBox = () => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  const sendMessage = () => {
    if (!text.trim()) return;

    setMessages([...messages, { sender: "You", text }]);
    setText("");
  };

  return (
    <div className="w-[450px] mx-auto mt-10 rounded-xl overflow-hidden shadow-xl bg-white">

      {/* Header */}
      <div className="bg-red-600 text-white text-center text-xl font-bold py-3">
        🚑 Emergency Chat
      </div>

      {/* Messages */}
      <div className="h-[240px] overflow-y-auto p-4 bg-gray-100">
        {messages.length === 0 && (
          <p className="text-gray-400">No messages yet...</p>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className="bg-white p-3 rounded-lg mb-3 shadow-sm"
          >
            <b>{msg.sender}:</b> {msg.text}
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="flex p-3 border-t">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type message..."
          className="flex-1 p-3 border rounded-lg text-base outline-none focus:ring-2 focus:ring-red-500"
        />

        <button
          onClick={sendMessage}
          className="ml-3 px-5 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition"
        >
          Send
        </button>
      </div>

    </div>
  );
};

export default ChatBox;