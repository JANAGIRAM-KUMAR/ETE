import React, { useEffect, useRef, useState } from "react";
import Peer from "simple-peer";
import { 
  emitCallUser, 
  listenCallMade, 
  emitAnswerCall, 
  listenCallAnswered, 
  emitEndCall,
  listenEndCall 
} from "../services/socketService";

const VideoCall = ({ targetId, userId, userName }) => {
  const [calling, setCalling] = useState(false);
  const [callReceived, setCallReceived] = useState(false);
  const [onCall, setOnCall] = useState(false);
  const [stream, setStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [callerSignal, setCallerSignal] = useState(null);
  const [callerId, setCallerId] = useState("");
  const [callerName, setCallerName] = useState("");
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [callType, setCallType] = useState("video"); // "audio" or "video"
  const [callDuration, setCallDuration] = useState(0);

  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();
  const timerRef = useRef();

  useEffect(() => {
    // Listen for incoming calls
    const offCallMade = listenCallMade((data) => {
      setCallReceived(true);
      setCallerId(data.from);
      setCallerName(data.name);
      setCallerSignal(data.signal);
      setCallType(data.type || "video");
    });

    // Listen for end call from other side
    const offEndCall = listenEndCall(() => {
      handleEndCall(false); // don't emit end call back
    });

    return () => {
      offCallMade();
      offEndCall();
      destroyPeer();
      stopTimer();
    };
  }, []);

  useEffect(() => {
    if (onCall) {
      startTimer();
    } else {
      stopTimer();
      setCallDuration(0);
    }
  }, [onCall]);

  // Sync streams to video refs whenever they are available
  useEffect(() => {
    if (onCall && callType === "video") {
      if (myVideo.current && stream) {
        myVideo.current.srcObject = stream;
      }
      if (userVideo.current && remoteStream) {
        userVideo.current.srcObject = remoteStream;
      }
    }
  }, [onCall, stream, remoteStream, callType]);

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const destroyPeer = () => {
    if (connectionRef.current) {
      connectionRef.current.destroy();
      connectionRef.current = null;
    }
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setStream(null);
    setRemoteStream(null);
  };

  const startStream = async (type) => {
    try {
      const constraints = { 
        video: type === "video", 
        audio: true 
      };
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      return mediaStream;
    } catch (err) {
      console.error("Failed to get media devices:", err);
      alert("Please enable camera and microphone access.");
    }
  };

  const callUser = async (type = "video") => {
    setCallType(type);
    setCalling(true);
    const mediaStream = await startStream(type);
    if (!mediaStream) {
      setCalling(false);
      return;
    }

    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: mediaStream,
      config: {
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" }
        ]
      }
    });

    peer.on("signal", (data) => {
      emitCallUser({
        userToCall: targetId,
        signalData: data,
        from: userId,
        name: userName,
        type: type
      });
    });

    peer.on("stream", (remStream) => {
      setRemoteStream(remStream);
    });

    const offCallAnswered = listenCallAnswered((data) => {
      peer.signal(data.signal);
      setOnCall(true);
      setCalling(false);
      offCallAnswered();
    });

    connectionRef.current = peer;
  };

  const answerCall = async () => {
    setCallReceived(false);
    const mediaStream = await startStream(callType);
    if (!mediaStream) return;

    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: mediaStream,
      config: {
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" }
        ]
      }
    });

    peer.on("signal", (data) => {
      emitAnswerCall({ to: callerId, signal: data });
    });

    peer.on("stream", (remStream) => {
      setRemoteStream(remStream);
    });

    peer.signal(callerSignal);
    setOnCall(true);
    connectionRef.current = peer;
  };

  const handleEndCall = (emitBack = true) => {
    if (emitBack) {
      emitEndCall({ to: targetId || callerId });
    }
    destroyPeer();
    setOnCall(false);
    setCallReceived(false);
    setCalling(false);
  };

  const toggleVideo = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setAudioEnabled(audioTrack.enabled);
      }
    }
  };

  // Expose start call functions via custom events
  useEffect(() => {
    const handleStartAudio = () => callUser("audio");
    const handleStartVideo = () => callUser("video");

    window.addEventListener("startAudioCall", handleStartAudio);
    window.addEventListener("startVideoCall", handleStartVideo);

    return () => {
      window.removeEventListener("startAudioCall", handleStartAudio);
      window.removeEventListener("startVideoCall", handleStartVideo);
    };
  }, [targetId, userId, userName]);

  if (!calling && !callReceived && !onCall) return null;

  return (
    <div className="fixed inset-0 z-[4000] flex items-center justify-center p-4 md:p-6 overflow-hidden">
      {/* Dark Overlay + Blur */}
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md transition-opacity duration-500"></div>

      {/* Main Call Card */}
      <div className="relative w-full max-w-lg bg-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 border border-slate-700/50">
        
        {/* INCOMING CALL SCREEN */}
        {callReceived && !onCall && (
          <div className="p-10 flex flex-col items-center justify-between min-h-[500px] text-center">
            <div className="space-y-2">
              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] animate-pulse">
                Priority Emergency Call Incoming
              </p>
              <h2 className="text-2xl font-black text-white">{callerName || "Responder"}</h2>
              <p className="text-slate-400 text-sm font-bold">{callType === "video" ? "Video Call" : "Audio Call"}</p>
            </div>

            <div className="relative">
              <div className="w-32 h-32 bg-slate-700 rounded-full flex items-center justify-center text-5xl shadow-inner border-4 border-slate-600">
                👤
              </div>
              <div className="absolute inset-0 rounded-full border-4 border-emerald-500 animate-ping opacity-20"></div>
              <div className="absolute inset-0 rounded-full border-2 border-emerald-500 animate-pulse opacity-40"></div>
            </div>

            <div className="flex gap-10 w-full justify-center">
              <div className="flex flex-col items-center gap-3">
                <button
                  onClick={answerCall}
                  className="w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 transition-all active:scale-90"
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </button>
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Accept</span>
              </div>
              
              <div className="flex flex-col items-center gap-3">
                <button
                  onClick={() => handleEndCall()}
                  className="w-16 h-16 bg-red-600 text-white rounded-full flex items-center justify-center shadow-xl shadow-red-500/20 hover:bg-red-700 transition-all active:scale-90"
                >
                  <svg className="w-8 h-8 rotate-[135deg]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </button>
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Decline</span>
              </div>
            </div>
          </div>
        )}

        {/* OUTGOING CALL SCREEN */}
        {calling && !onCall && (
          <div className="p-10 flex flex-col items-center justify-between min-h-[500px] text-center">
            <div className="space-y-2">
              <p className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em]">
                Establishing Secure Channel
              </p>
              <h2 className="text-2xl font-black text-white">Calling...</h2>
              <p className="text-slate-400 text-sm font-bold">Encrypted {callType === "video" ? "Video" : "Audio"} Link</p>
            </div>

            <div className="relative">
              <div className="w-32 h-32 bg-slate-700 rounded-full flex items-center justify-center text-5xl shadow-inner border-4 border-slate-600">
                👤
              </div>
              <div className="absolute inset-0 rounded-full border-4 border-red-500 animate-pulse opacity-20"></div>
              <div className="absolute inset-0 rounded-full border-2 border-red-500 animate-ping opacity-40"></div>
            </div>

            <div className="flex flex-col items-center gap-3">
              <button
                onClick={() => handleEndCall()}
                className="w-16 h-16 bg-red-600 text-white rounded-full flex items-center justify-center shadow-xl shadow-red-500/20 hover:bg-red-700 transition-all active:scale-90"
              >
                <svg className="w-8 h-8 rotate-[135deg]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </button>
              <span className="text-[10px] font-black text-white uppercase tracking-widest">Cancel</span>
            </div>
          </div>
        )}

        {/* ACTIVE CALL SCREEN */}
        {onCall && (
          <div className="relative h-[600px] bg-slate-900 flex flex-col">
            
            {/* VIDEO LAYOUT */}
            {callType === "video" ? (
              <>
                <div className="flex-1 relative overflow-hidden bg-black">
                  <video playsInline ref={userVideo} autoPlay className="w-full h-full object-cover" />
                  
                  {/* Floating My Camera (PIP) */}
                  <div className="absolute top-6 right-6 w-32 aspect-[3/4] rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl z-10 bg-slate-800">
                    <video playsInline muted ref={myVideo} autoPlay className="w-full h-full object-cover" />
                  </div>

                  {/* Remote Name/Info Overlay */}
                  <div className="absolute top-6 left-6 flex items-center gap-3 bg-black/20 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">
                      {callerName || "Remote Contact"}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              /* AUDIO LAYOUT */
              <div className="flex-1 flex flex-col items-center justify-center gap-8">
                <div className="w-32 h-32 bg-slate-800 rounded-full flex items-center justify-center text-5xl border-4 border-slate-700 shadow-2xl">
                  👤
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-black text-white">{callerName || "Responder"}</h3>
                  <p className="text-emerald-400 text-sm font-bold tracking-widest">{formatDuration(callDuration)}</p>
                </div>
              </div>
            )}

            {/* CONTROLS (BOTTOM) */}
            <div className="absolute bottom-10 left-0 right-0 flex justify-center items-center gap-6 z-20">
              <button
                onClick={toggleAudio}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all active:scale-90 shadow-xl ${
                  audioEnabled 
                    ? "bg-white/10 text-white hover:bg-white/20" 
                    : "bg-red-600 text-white"
                }`}
              >
                {audioEnabled ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.586 15H4a1 1 0 01-1-1V6a1 1 0 011-1h6.586l.707.707L3.707 13.293 5.586 15z m4.414 0h3a1 1 0 001-1V10.414l-4-4V15zM17 14V6h-3.586l4-4L19 3.586 11.414 11H17z" />
                  </svg>
                )}
              </button>

              <button
                onClick={() => handleEndCall()}
                className="w-16 h-16 bg-red-600 text-white rounded-full flex items-center justify-center shadow-2xl shadow-red-500/40 hover:bg-red-700 transition-all active:scale-90"
              >
                <svg className="w-8 h-8 rotate-[135deg]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </button>

              {callType === "video" && (
                <button
                  onClick={toggleVideo}
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition-all active:scale-90 shadow-xl ${
                    videoEnabled 
                      ? "bg-white/10 text-white hover:bg-white/20" 
                      : "bg-red-600 text-white"
                  }`}
                >
                  {videoEnabled ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoCall;
