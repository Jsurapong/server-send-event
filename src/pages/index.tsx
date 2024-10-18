import React, { useState, useEffect } from "react";
import localFont from "next/font/local";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});
interface SSEComponentProps {
  sseUrl: string;
}

const sseUrl = "http://localhost:3000/api/stream";
const SSEComponent: React.FC<SSEComponentProps> = () => {
  const [messages, setMessages] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [eventSource, setEventSource] = useState<EventSource | null>(null);

  useEffect(() => {
    const source = new EventSource(sseUrl);

    source.onopen = () => {
      console.log("on open");
      setIsConnected(true);
    };

    source.onmessage = (event) => {
      console.log("on message", event);
      setMessages((prevMessages) => [...prevMessages, event.data]);
    };

    source.onerror = () => {
      console.log("on error ");
      setIsConnected(false);
      source.close();
    };

    setEventSource(source);

    return () => {
      source.close();
    };
  }, []);

  const handleClose = () => {
    if (eventSource) {
      eventSource.close();
    }
  };

  const handleReconnect = () => {
    handleClose();
    setEventSource(new EventSource(sseUrl));
  };

  return (
    <div
      className={`${geistSans.variable} ${geistMono.variable} grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]`}
    >
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <div>
          <h1>Example Server Sent Event</h1>
          <div>
            <button
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              onClick={handleClose}
              disabled={!isConnected}
            >
              Close SSE
            </button>
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={handleReconnect}
              disabled={isConnected}
            >
              Reconnect SSE
            </button>
            <div>
              message
              {messages.map((message, index) => (
                <div key={index}>{message}</div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SSEComponent;
