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
      alert("Establishing secure communication link...");
      return;
    }
    sendChatMessage({ emergencyId, senderId, message: text, targetId });
    setMessages((prev) => [...prev, { message: text, isSelf: true }]);
    setText("");
  };

  return (
    <div className="w-full h-full flex flex-col bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
      {/* Header - Using Red instead of Black */}
      <div className="bg-red-600 px-8 py-5 flex items-center justify-between shadow-lg shadow-red-500/20 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-red-600 text-lg shadow-inner">
            💬
          </div>
          <div>
            <h3 className="text-sm font-black text-white tracking-tight uppercase">Emergency Comms</h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-1 h-1 bg-white/60 rounded-full animate-pulse"></div>
              <p className="text-[9px] font-black text-white/60 uppercase tracking-widest">Secure Channel</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-5 custom-scrollbar bg-slate-50/30">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center px-10 opacity-30">
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-relaxed italic">
              Channel established. Immediate communication advised for optimal coordination.
            </p>
          </div>
        )}
        
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex flex-col ${msg.isSelf ? "items-end" : "items-start"}`}
          >
            <div
              className={`max-w-[85%] px-5 py-3.5 rounded-2xl text-[13px] font-bold shadow-sm ${
                msg.isSelf 
                  ? "bg-red-600 text-white rounded-tr-none shadow-red-500/10" 
                  : "bg-white text-slate-700 border border-slate-100 rounded-tl-none"
              }`}
            >
              {msg.message}
            </div>
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter mt-2 px-1">
              {msg.isSelf ? "Transmitted" : "Received"}
            </span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="p-6 bg-white border-t border-slate-50">
        <div className="flex items-center gap-3 bg-slate-100 rounded-2xl p-2 border border-slate-200 focus-within:border-red-500 focus-within:ring-4 focus-within:ring-red-100 transition-all duration-300">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type coordination message..."
            className="flex-1 bg-transparent px-4 py-2 text-sm font-bold text-slate-700 outline-none placeholder:text-slate-400"
          />
          <button
            onClick={handleSend}
            className="bg-red-600 text-white w-10 h-10 rounded-xl shadow-lg shadow-red-500/30 flex items-center justify-center hover:bg-red-700 transition-all active:scale-90"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;