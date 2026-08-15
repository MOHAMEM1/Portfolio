"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Send, Bot, User, Sparkles } from "lucide-react"
import { generateSmartResponse } from "@/lib/chatbot-knowledge"

interface Message {
  id: number
  text: string
  sender: "user" | "bot"
  time: string
}

interface ChatbotDialogProps {
  onClose: () => void
}

const quickReplies = [
  "Comment soumettre un projet ?",
  "Quels documents nécessaires ?",
  "Montant de financement ?",
  "Contacter un conseiller",
]

function getTimeString(): string {
  const now = new Date()
  return now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
}

function getBotResponse(input: string): string {
  // Use the intelligent knowledge base for response generation
  return generateSmartResponse(input)
}

const ChatbotDialog = ({ onClose }: ChatbotDialogProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Bonjour ! Je suis l'assistant virtuel de l'INDH. Comment puis-je vous aider aujourd'hui ?",
      sender: "bot",
      time: getTimeString(),
    },
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  const sendMessage = (text: string) => {
    if (text.trim() === "") return

    const userMessage: Message = {
      id: messages.length + 1,
      text,
      sender: "user",
      time: getTimeString(),
    }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsTyping(true)

    setTimeout(() => {
      const response = getBotResponse(text)
      const botMessage: Message = {
        id: messages.length + 2,
        text: response,
        sender: "bot",
        time: getTimeString(),
      }
      setIsTyping(false)
      setMessages((prev) => [...prev, botMessage])
    }, 1000 + Math.random() * 500)
  }

  const handleSend = () => sendMessage(input)

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSend()
  }

  return (
    <Card className="fixed bottom-24 right-6 w-[340px] sm:w-[400px] h-[500px] flex flex-col shadow-2xl z-50 border-0 rounded-2xl overflow-hidden animate-scale-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-700 to-emerald-600 text-white p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
          <Bot className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h3 className="font-heading font-bold text-sm">Assistant INDH</h3>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-300 animate-pulse" />
            <span className="text-[10px] text-white/70">En ligne</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Bot className="h-4 w-4 text-amber-300" />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"} animate-fade-in-up`}
          >
            <div className={`flex gap-2 max-w-[85%] ${message.sender === "user" ? "flex-row-reverse" : ""}`}>
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-1 ${
                  message.sender === "user"
                    ? "bg-green-600 text-white"
                    : "bg-white border border-gray-200 text-green-600"
                }`}
              >
                {message.sender === "user" ? (
                  <User className="h-3.5 w-3.5" />
                ) : (
                  <Bot className="h-3.5 w-3.5" />
                )}
              </div>
              <div>
                <div
                  className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${
                    message.sender === "user"
                      ? "bg-gradient-to-br from-green-600 to-emerald-600 text-white rounded-tr-md"
                      : "bg-white text-gray-700 shadow-sm border border-gray-100 rounded-tl-md"
                  }`}
                >
                  {message.text}
                </div>
                <p
                  className={`text-[10px] text-gray-400 mt-1 ${
                    message.sender === "user" ? "text-right" : ""
                  }`}
                >
                  {message.time}
                </p>
              </div>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start animate-fade-in-up">
            <div className="flex gap-2">
              <div className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-green-600">
                <Bot className="h-3.5 w-3.5" />
              </div>
              <div className="bg-white rounded-2xl rounded-tl-md px-4 py-3 shadow-sm border border-gray-100">
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-gray-300 animate-bounce [animation-delay:0ms]" />
                  <span className="w-2 h-2 rounded-full bg-gray-300 animate-bounce [animation-delay:150ms]" />
                  <span className="w-2 h-2 rounded-full bg-gray-300 animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Replies */}
      {messages.length <= 2 && !isTyping && (
        <div className="px-4 py-2 bg-white border-t border-gray-100">
          <div className="flex flex-wrap gap-1.5">
            {quickReplies.map((reply) => (
              <button
                key={reply}
                onClick={() => sendMessage(reply)}
                className="px-3 py-1.5 rounded-full bg-green-50 text-green-700 text-[11px] font-medium hover:bg-green-100 transition-colors border border-green-100"
              >
                {reply}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-3 bg-white border-t border-gray-100 flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Tapez votre message..."
          className="flex-1 rounded-xl h-11 border-gray-200 focus:border-green-400"
        />
        <Button
          onClick={handleSend}
          size="icon"
          className="bg-gradient-to-br from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-xl h-11 w-11 flex-shrink-0"
          disabled={!input.trim()}
        >
          <Send size={16} />
        </Button>
      </div>
    </Card>
  )
}

export default ChatbotDialog
