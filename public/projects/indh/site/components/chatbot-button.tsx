"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { MessageCircle, X } from "lucide-react"
import ChatbotDialog from "./chatbot-dialog"

const ChatbotButton = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [hasBeenOpened, setHasBeenOpened] = useState(false)

  const toggleChatbot = () => {
    setIsOpen(!isOpen)
    if (!hasBeenOpened) setHasBeenOpened(true)
  }

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {/* Tooltip - only shown if never opened */}
        {!hasBeenOpened && (
          <div className="absolute bottom-full right-0 mb-3 animate-fade-in-up">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 px-4 py-2.5 whitespace-nowrap">
              <p className="text-sm font-medium text-gray-700">💬 Besoin d&apos;aide ?</p>
              <div className="absolute bottom-0 right-6 translate-y-1/2 rotate-45 w-2.5 h-2.5 bg-white border-r border-b border-gray-100" />
            </div>
          </div>
        )}

        <Button
          onClick={toggleChatbot}
          className={`relative rounded-2xl w-14 h-14 shadow-xl transition-all duration-500 ${
            isOpen
              ? "bg-gray-800 hover:bg-gray-900 rotate-0"
              : "bg-gradient-to-br from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 pulse-glow"
          }`}
          aria-label="Assistant INDH"
        >
          <div className="relative">
            {isOpen ? (
              <X size={22} className="transition-transform duration-300" />
            ) : (
              <>
                <MessageCircle size={22} className="transition-transform duration-300" />
                {/* Notification dot */}
                {!hasBeenOpened && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500 border-2 border-white animate-pulse" />
                )}
              </>
            )}
          </div>
        </Button>
      </div>

      {isOpen && <ChatbotDialog onClose={() => setIsOpen(false)} />}
    </>
  )
}

export default ChatbotButton
