import { createFileRoute, useNavigate, redirect } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { 
  Heart,
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  SkipForward, 
  Flag, 
  XCircle, 
  RotateCcw,
  Search,
  Send
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "~/lib/utils";

export const Route = createFileRoute("/chat")({
  beforeLoad: () => {
    if (typeof window !== "undefined") {
      const isVerified = localStorage.getItem("age-verified");
      if (isVerified !== "true") {
        throw redirect({ to: "/" });
      }
    }
  },
  component: ChatPage,
});

function ChatPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"idle" | "searching" | "connected">("idle");
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [preference, setPreference] = useState("everyone");
  const [userId, setUserId] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState("");

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const processedSignals = useRef<Set<string>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);

  const createUser = useMutation(api.chat.createOrUpdateUser);
  const findMatch = useMutation(api.chat.findMatch);
  const sendSignal = useMutation(api.chat.sendSignal);
  const leaveRoom = useMutation(api.chat.leaveRoom);

  const room = useQuery(api.chat.getRoom, userId ? { userId } : "skip");
  const signals = useQuery(api.chat.getSignals, room ? { roomId: room._id, userId } : "skip");

  useEffect(() => {
    let token = localStorage.getItem("chat-token");
    const userGender = localStorage.getItem("user-gender") || "random";
    
    // Auto-select opposite gender preference
    if (userGender === "male") setPreference("female");
    else if (userGender === "female") setPreference("male");
    else setPreference("everyone");

    if (!token) {
      token = Math.random().toString(36).substring(7);
      localStorage.setItem("chat-token", token);
    }

    async function init() {
        const id = await createUser({ 
            token: token!, 
            gender: userGender, 
            preference 
        });
        setUserId(id);
    }
    init();

    async function startLocalStream() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing media devices:", err);
      }
    }
    startLocalStream();

    return () => {
        localStreamRef.current?.getTracks().forEach(track => track.stop());
        if (room && userId) {
            leaveRoom({ userId, roomId: room._id });
        }
    };
  }, [preference, createUser, room?._id, userId, leaveRoom, navigate]);

  useEffect(() => {
    if (!room || !userId) {
        if (status === "connected") setStatus("idle");
        return;
    }

    setStatus("connected");
    processedSignals.current.clear();
    setMessages([]);

    const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
    });
    pcRef.current = pc;

    localStreamRef.current?.getTracks().forEach(track => {
        if (localStreamRef.current) pc.addTrack(track, localStreamRef.current);
    });

    pc.ontrack = (event) => {
        if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = event.streams[0];
        }
    };

    pc.onicecandidate = (event) => {
        if (event.candidate && room) {
            sendSignal({
                roomId: room._id,
                senderId: userId,
                type: "candidate",
                data: JSON.stringify(event.candidate)
            });
        }
    };

    const isInitiator = room.userA === userId;

    async function setupSignaling() {
        if (isInitiator && room) {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            await sendSignal({
                roomId: room._id,
                senderId: userId,
                type: "offer",
                data: JSON.stringify(offer)
            });
        }
    }

    setupSignaling();

    return () => {
        pc.close();
        pcRef.current = null;
    };
  }, [room?._id, userId, sendSignal]);

  useEffect(() => {
    if (!signals || !pcRef.current || !room || !userId) return;

    async function handleSignals() {
        if (!signals || !pcRef.current || !room) return;
        for (const signal of signals) {
            if (processedSignals.current.has(signal._id)) continue;
            processedSignals.current.add(signal._id);

            if (signal.type === "message") {
                setMessages(prev => [...prev, {
                    id: signal._id,
                    text: signal.data,
                    isMe: signal.senderId === userId,
                    timestamp: signal.timestamp
                }]);
                continue;
            }

            const data = JSON.parse(signal.data);
            if (signal.type === "offer" && pcRef.current.signalingState === "stable") {
                await pcRef.current.setRemoteDescription(new RTCSessionDescription(data));
                const answer = await pcRef.current.createAnswer();
                await pcRef.current.setLocalDescription(answer);
                await sendSignal({
                    roomId: room._id,
                    senderId: userId,
                    type: "answer",
                    data: JSON.stringify(answer)
                });
            } else if (signal.type === "answer" && pcRef.current.signalingState === "have-local-offer") {
                await pcRef.current.setRemoteDescription(new RTCSessionDescription(data));
            } else if (signal.type === "candidate") {
                try {
                    await pcRef.current.addIceCandidate(new RTCIceCandidate(data));
                } catch (e) {
                    console.error("Error adding ice candidate", e);
                }
            }
        }
    }

    handleSignals();
  }, [signals, room?._id, userId, sendSignal]);

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleStart = async () => {
    if (!userId) return;
    setStatus("searching");
    await findMatch({ userId });
  };

  const handleSkip = async () => {
    if (room && userId) {
        await leaveRoom({ userId, roomId: room._id });
    }
    setStatus("searching");
    await findMatch({ userId });
  };

  const handleEnd = async () => {
      if (room && userId) {
          await leaveRoom({ userId, roomId: room._id });
      }
      navigate({ to: "/" });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !room || !userId) return;

    const text = inputValue.trim();
    setInputValue("");

    await sendSignal({
        roomId: room._id,
        senderId: userId,
        type: "message",
        data: text
    });
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      <header className="h-16 border-b border-white/5 bg-zinc-900/50 backdrop-blur-md flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-rose-600 rounded-lg flex items-center justify-center">
            <Heart className="w-4 h-4 text-white fill-current" />
          </div>
          <span className="font-black tracking-tighter uppercase italic text-lg">Kamacam</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:flex bg-zinc-800 rounded-full p-1 border border-white/5">
            {["Everyone", "Male", "Female"].map((p) => (
              <button
                key={p}
                onClick={() => setPreference(p.toLowerCase())}
                className={cn(
                  "px-4 py-1.5 rounded-full text-xs font-medium transition-all",
                  preference === p.toLowerCase() ? "bg-pink-600 text-white" : "text-zinc-400 hover:text-white"
                )}
              >
                {p}
              </button>
            ))}
          </div>
          <button 
            onClick={handleEnd}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>
      </header>

      <main className="flex-1 relative flex flex-col md:flex-row gap-4 p-4 overflow-hidden">
        {/* Main View Area */}
        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
            <div className="flex-1 relative rounded-3xl bg-zinc-900 border border-white/5 overflow-hidden group shadow-2xl">
                <AnimatePresence mode="wait">
                    {status === "searching" ? (
                    <motion.div 
                        key="searching"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 flex flex-col items-center justify-center text-center p-8"
                    >
                        <div className="relative mb-8">
                            <div className="w-32 h-32 border-4 border-pink-500/20 border-t-pink-500 rounded-full animate-spin" />
                            <Search className="w-12 h-12 text-pink-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Looking for a match...</h2>
                        <p className="text-zinc-500">Searching for someone based on your preferences</p>
                    </motion.div>
                    ) : status === "idle" ? (
                    <motion.div 
                        key="idle"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 bg-gradient-to-br from-pink-900/20 to-black"
                    >
                        <div className="w-24 h-24 bg-pink-600/10 rounded-full flex items-center justify-center mb-6">
                            <Video className="w-10 h-10 text-pink-500" />
                        </div>
                        <h2 className="text-3xl font-bold mb-4">Ready to meet someone?</h2>
                        <p className="text-zinc-400 mb-8 max-w-md">Click the button below to start your random video chat journey.</p>
                        <button 
                        onClick={handleStart}
                        className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-4 px-12 rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-xl shadow-pink-500/20"
                        >
                        Start Chatting
                        </button>
                    </motion.div>
                    ) : (
                    <video 
                        key="remote"
                        ref={remoteVideoRef}
                        autoPlay 
                        playsInline 
                        className="w-full h-full object-cover scale-x-[-1]"
                    />
                    )}
                </AnimatePresence>

                {status === "connected" && (
                    <div className="absolute top-6 left-6 flex flex-col gap-2 pointer-events-none">
                    <div className="bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-xs font-semibold uppercase tracking-wider">Connected</span>
                    </div>
                    </div>
                )}
            </div>
            
            {/* Controls Bar for Desktop Bottom */}
            <div className="hidden md:flex bg-zinc-900 rounded-2xl border border-white/5 p-4 items-center gap-4">
                <div className="flex gap-2">
                    <ControlButtonSmall 
                        onClick={() => setIsMicOn(!isMicOn)}
                        active={isMicOn}
                        icon={isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                    />
                    <ControlButtonSmall 
                        onClick={() => setIsCameraOn(!isCameraOn)}
                        active={isCameraOn}
                        icon={isCameraOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                    />
                </div>
                <button 
                    onClick={handleSkip}
                    disabled={status === "idle"}
                    className="flex-1 bg-white text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-zinc-200 transition-all disabled:opacity-50"
                >
                    <SkipForward className="w-4 h-4" />
                    Skip
                </button>
                <div className="flex gap-2">
                    <button className="p-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded-xl transition-all">
                        <Flag className="w-5 h-5" />
                    </button>
                    <button onClick={handleEnd} className="p-3 bg-zinc-800 hover:bg-red-500/20 hover:text-red-500 text-zinc-400 rounded-xl transition-all">
                        <RotateCcw className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>

        {/* Sidebar (Chat & Preview) */}
        <div className="w-full md:w-80 flex flex-col gap-4 shrink-0 overflow-hidden">
          {/* Self Video */}
          <div className="relative aspect-video md:aspect-square rounded-3xl bg-zinc-900 border border-white/5 overflow-hidden shadow-xl shrink-0">
            <video 
              ref={localVideoRef}
              autoPlay 
              muted 
              playsInline 
              className={cn(
                "w-full h-full object-cover transition-opacity scale-x-[-1]",
                isCameraOn ? "opacity-100" : "opacity-0"
              )}
            />
            {!isCameraOn && (
                <div className="absolute inset-0 flex items-center justify-center bg-zinc-800">
                    <VideoOff className="w-12 h-12 text-zinc-600" />
                </div>
            )}
            <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] font-bold text-white border border-white/10 uppercase tracking-widest">
                You
            </div>
          </div>

          {/* Chat Panel */}
          <div className="flex-1 bg-zinc-900 rounded-3xl border border-white/5 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">Live Chat</span>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-pink-500 rounded-full" />
                    <span className="text-[10px] font-bold text-pink-500 uppercase tracking-widest">18+ Uncensored</span>
                </div>
            </div>
            
            <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-3 scroll-smooth"
            >
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-4">
                        <Heart className="w-8 h-8 text-zinc-800 mb-2" />
                        <p className="text-[10px] uppercase tracking-wider text-zinc-600 font-bold">Say hi to your match</p>
                    </div>
                ) : (
                    messages.map((msg) => (
                        <div 
                            key={msg.id}
                            className={cn(
                                "max-w-[85%] rounded-2xl px-4 py-2 text-sm",
                                msg.isMe 
                                    ? "bg-pink-600 text-white ml-auto rounded-tr-none shadow-lg shadow-pink-500/10" 
                                    : "bg-zinc-800 text-zinc-200 rounded-tl-none border border-white/5"
                            )}
                        >
                            {msg.text}
                        </div>
                    ))
                )}
            </div>

            <form 
                onSubmit={handleSendMessage}
                className="p-3 bg-black/20 border-t border-white/5 flex gap-2"
            >
                <input 
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-zinc-800 border border-white/5 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-pink-500/50 transition-all placeholder:text-zinc-600"
                />
                <button 
                    type="submit"
                    className="bg-pink-600 hover:bg-pink-700 text-white p-2.5 rounded-xl transition-all shadow-lg shadow-pink-500/20 active:scale-95"
                >
                    <Send className="w-5 h-5" />
                </button>
            </form>
          </div>
        </div>
      </main>

      <div className="bg-pink-600/10 border-t border-white/5 py-2 px-6 text-center text-[10px] text-pink-400 font-medium tracking-wide shrink-0">
        REMINDER: FREEDOM OF EXPRESSION IS PERMITTED FOR ADULTS. ILLEGAL CONTENT (CSAM) OR NON-CONSENSUAL SHARING IS STRICTLY PROHIBITED AND WILL BE REPORTED TO AUTHORITIES.
      </div>
    </div>
  );
}

function ControlButtonSmall({ onClick, active, icon }: { onClick: () => void, active: boolean, icon: React.ReactNode }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "p-3 rounded-xl transition-all border",
        active 
          ? "bg-zinc-800 border-white/5 text-white hover:bg-zinc-700" 
          : "bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500/20"
      )}
    >
      {icon}
    </button>
  );
}
