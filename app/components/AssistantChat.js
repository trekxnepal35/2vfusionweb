
"use client";

import { useState, useRef, useEffect } from "react";

export default function AssistantChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Namaste! Welcome to Fusion Expeditions. How can I help you plan your Nepal adventure?",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  async function handleSendMessage(event) {
    event.preventDefault();

    const trimmedMessage = message.trim();

    if (!trimmedMessage || isLoading) return;

    setMessages((previous) => [
      ...previous,
      { role: "user", content: trimmedMessage },
    ]);
    setMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: trimmedMessage }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to get a response.");
      }

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content: data.answer || "Sorry, I couldn't find an answer.",
        },
      ]);
    } catch (error) {
      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content:
            "Sorry, I'm having trouble responding right now. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-[100]">
      {isOpen && (
        <div className="mb-4 flex h-[min(600px,75vh)] w-[min(360px,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between bg-emerald-700 px-4 py-4 text-white">
            <div>
              <h2 className="font-bold">Fusion Expeditions</h2>
              <p className="text-xs text-emerald-100">
                Trek & Travel Assistant
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
              className="rounded-lg px-3 py-1 text-xl hover:bg-emerald-600"
            >
              ×
            </button>
          </div>

          <div
            className="flex-1 space-y-4 overflow-y-auto bg-slate-50 p-4"
            aria-live="polite"
          >
            {messages.map((item, index) => (
              <div
                key={index}
                className={`flex ${
                  item.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-4 py-3 text-sm leading-6 ${
                    item.role === "user"
                      ? "rounded-br-sm bg-emerald-700 text-white"
                      : "rounded-bl-sm border border-slate-200 bg-white text-slate-800"
                  }`}
                >
                  {item.content}
                </div>
              </div>
            ))}

            {isLoading && (
              <p className="text-sm text-slate-500">
                Assistant is thinking...
              </p>
            )}

            <div ref={messagesEndRef} />
          </div>

          <form
            onSubmit={handleSendMessage}
            className="flex gap-2 border-t border-slate-200 bg-white p-3"
          >
            <input
              type="text"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Ask about treks or tours..."
              maxLength={2000}
              disabled={isLoading}
              aria-label="Your message"
              className="min-w-0 flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-100"
            />

            <button
              type="submit"
              disabled={!message.trim() || isLoading}
              className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((previous) => !previous)}
        aria-label={isOpen ? "Close assistant chat" : "Open assistant chat"}
        aria-expanded={isOpen}
        className="ml-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-700 text-2xl text-white shadow-lg transition hover:scale-105 hover:bg-emerald-800"
      >
        {isOpen ? "×" : "💬"}
      </button>
    </div>
  );
}
