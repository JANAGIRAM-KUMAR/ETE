import React, { useEffect, useRef, useState } from "react";
import { 
  emitCallUser, 
  listenCallMade, 
  emitAnswerCall, 
  listenCallAnswered, 
  emitIceCandidate, 
  listenIceCandidate,
  emitEndCall,
  listenEndCall 
} from "../services/socketService";

const VideoCall = ({ targetId, userId, userName }) => {
  const [calling, setCalling] = useState(false);
  const [callReceived, setCallReceived] = useState(false);
  const [onCall, setOnCall] = useState(false);
  const [stream, setStream] = useState(null);
  const [callerSignal, setCallerSignal] = useState(null);
  const [callerId, setCallerId] = useState("");
  const [callerName, setCallerName] = useState("");
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);

  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();

  useEffect(() => {
    // Listen for incoming calls
    const offCallMade = listenCallMade((data) => {
      setCallReceived(true);
      setCallerId(data.from);
      setCallerName(data.name);
      setCallerSignal(data.signal);
    });

    // Listen for end call from other side
    const offEndCall = listenEndCall(() => {
      handleEndCall();
    });

    return () => {
      offCallMade();
      offEndCall();
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const startStream = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setStream(mediaStream);
      if (myVideo.current) {
        myVideo.current.srcObject = mediaStream;
      }
      return mediaStream;
    } catch (err) {
      console.error("Failed to get media devices:", err);
      alert("Please enable camera and microphone access.");
    }
  };

  const callUser = async () => {
    setCalling(true);
    const mediaStream = await startStream();
    if (!mediaStream) return;

    const peer = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
    });

    mediaStream.getTracks().forEach(track => peer.addTrack(track, mediaStream));

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        emitIceCandidate({ to: targetId, candidate: event.candidate });
      }
    };

    peer.ontrack = (event) => {
      if (userVideo.current) {
        userVideo.current.srcObject = event.streams[0];
      }
    };

    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);

    emitCallUser({
      userToCall: targetId,
      signalData: offer,
      from: userId,
      name: userName
    });

    const offCallAnswered = listenCallAnswered((data) => {
      peer.setRemoteDescription(new RTCSessionDescription(data.signal));
      setOnCall(true);
      setCalling(false);
    });

    const offIce = listenIceCandidate((data) => {
      peer.addIceCandidate(new RTCIceCandidate(data.candidate));
    });

    connectionRef.current = peer;
  };

  const answerCall = async () => {
    setCallReceived(false);
    const mediaStream = await startStream();
    if (!mediaStream) return;

    const peer = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
    });

    mediaStream.getTracks().forEach(track => peer.addTrack(track, mediaStream));

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        emitIceCandidate({ to: callerId, candidate: event.candidate });
      }
    };

    peer.ontrack = (event) => {
      if (userVideo.current) {
        userVideo.current.srcObject = event.streams[0];
      }
    };

    await peer.setRemoteDescription(new RTCSessionDescription(callerSignal));
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);

    emitAnswerCall({ to: callerId, signal: answer });

    const offIce = listenIceCandidate((data) => {
      peer.addIceCandidate(new RTCIceCandidate(data.candidate));
    });

    setOnCall(true);
    connectionRef.current = peer;
  };

  const handleEndCall = () => {
    emitEndCall({ to: targetId || callerId });
    if (connectionRef.current) {
      connectionRef.current.close();
    }
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setOnCall(false);
    setCallReceived(false);
    setCalling(false);
    setStream(null);
  };

  const toggleVideo = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      videoTrack.enabled = !videoTrack.enabled;
      setVideoEnabled(videoTrack.enabled);
    }
  };

  const toggleAudio = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      setAudioEnabled(audioTrack.enabled);
    }
  };

  return (
    <div className="fixed bottom-8 left-8 z-[3000]">
      {/* Call UI */}
      {!onCall && !callReceived && !calling && (
        <button
          onClick={callUser}
          className="bg-red-600 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-2xl hover:bg-red-700 transition-all active:scale-90 animate-bounce"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>
      )}

      {/* Calling/Receiving UI */}
      {(calling || callReceived) && !onCall && (
        <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl border border-slate-100 flex flex-col items-center gap-6 animate-in slide-in-from-bottom duration-300">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center relative">
             <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-20"></div>
             <span className="text-3xl">📞</span>
          </div>
          <div className="text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
              {calling ? "Establishing Secure Line" : "Priority Call Incoming"}
            </p>
            <p className="text-xl font-black text-slate-900">
              {calling ? "Calling..." : callerName || "Local Responder"}
            </p>
          </div>
          <div className="flex gap-4">
            {callReceived ? (
              <>
                <button onClick={answerCall} className="bg-emerald-500 text-white px-8 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-emerald-200">Accept</button>
                <button onClick={handleEndCall} className="bg-red-600 text-white px-8 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-red-200">Decline</button>
              </>
            ) : (
              <button onClick={handleEndCall} className="bg-red-600 text-white px-10 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-red-200">Cancel</button>
            )}
          </div>
        </div>
      )}

      {/* On Call UI */}
      {onCall && (
        <div className="bg-slate-900 w-[320px] rounded-[2.5rem] shadow-2xl overflow-hidden border-4 border-white animate-in zoom-in duration-300">
          <div className="relative aspect-video bg-slate-800">
            <video playsInline ref={userVideo} autoPlay className="w-full h-full object-cover" />
            <div className="absolute top-4 right-4 w-24 aspect-video rounded-xl overflow-hidden border-2 border-white/20 shadow-xl">
              <video playsInline muted ref={myVideo} autoPlay className="w-full h-full object-cover" />
            </div>
            
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3">
              <button onClick={toggleAudio} className={`p-3 rounded-2xl backdrop-blur-md transition-all ${audioEnabled ? 'bg-white/10 text-white' : 'bg-red-600 text-white'}`}>
                {audioEnabled ? '🎤' : '🔇'}
              </button>
              <button onClick={toggleVideo} className={`p-3 rounded-2xl backdrop-blur-md transition-all ${videoEnabled ? 'bg-white/10 text-white' : 'bg-red-600 text-white'}`}>
                {videoEnabled ? '📷' : '🚫'}
              </button>
              <button onClick={handleEndCall} className="p-3 bg-red-600 text-white rounded-2xl shadow-xl active:scale-90">
                <svg className="w-5 h-5 rotate-[135deg]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoCall;
