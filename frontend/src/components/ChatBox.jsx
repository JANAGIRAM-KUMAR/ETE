import React, { useState, useEffect, useRef } from "react";
import { listenChatMessages, sendChatMessage } from "../services/socketService";

const ChatBox = ({ emergencyId, senderId, targetId }) => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    const off = listenChatMessages((msg) => {
      setMessages((prev) => [...prev, { ...msg, isSelf: false }]);
    });
    return off;
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!text.trim()) return;
    if (!emergencyId || !senderId || !targetId) {
      alert("Chat unavailable: missing emergency or participant info.");
      return;
    }
    sendChatMessage({ emergencyId, senderId, message: text, targetId });
    setMessages((prev) => [...prev, { message: text, isSelf: true }]);
    setText("");
  };

  return (
    <div className="w-full rounded-xl overflow-hidden shadow-xl bg-white">
      <div className="bg-red-600 text-white text-center text-xl font-bold py-3">
        🚑 Emergency Chat
      </div>
      <div className="h-[300px] overflow-y-auto p-4 bg-gray-100">
        {messages.length === 0 && (
          <p className="text-gray-400 text-sm">No messages yet. Start communicating...</p>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`p-3 rounded-lg mb-2 shadow-sm max-w-[80%] ${
              msg.isSelf ? "bg-red-100 ml-auto text-right" : "bg-white"
            }`}
          >
            <span className="text-xs text-gray-500 block mb-1">
              {msg.isSelf ? "You" : "Responder"}
            </span>
            {msg.message}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="flex p-3 border-t">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type message..."
          className="flex-1 p-3 border rounded-lg text-base outline-none focus:ring-2 focus:ring-red-500"
        />
        <button
          onClick={handleSend}
          className="ml-3 px-5 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
