
import React, { useState, useEffect, useRef } from 'react';
import { Chat } from '@google/genai';
import * as geminiService from '../services/geminiService';
import { ChatMessage } from '../types';
import Spinner from './Spinner';

const AiChat: React.FC = () => {
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initChat = () => {
      const session = geminiService.createChatSession();
      setChatSession(session);
      setMessages([{
        role: 'model',
        text: "Hello! I'm your Scrabble Scholar. Ask me anything about rules, strategies, or word origins!"
      }]);
    };
    initChat();
  }, []);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || !chatSession || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', text: currentMessage.trim() };
    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsLoading(true);

    try {
      const response = await chatSession.sendMessage({ message: userMessage.text });
      const modelMessage: ChatMessage = { role: 'model', text: response.text };
      setMessages(prev => [...prev, modelMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: ChatMessage = { role: 'model', text: "Sorry, I encountered an error. Please try again." };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[70vh]">
      <div className="flex-grow p-4 sm:p-6 overflow-y-auto bg-amber-50">
        <div className="space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
              {msg.role === 'model' && <div className="w-8 h-8 rounded-full bg-amber-700 text-white flex items-center justify-center font-bold flex-shrink-0">S</div>}
              <div className={`max-w-md p-3 rounded-xl ${msg.role === 'user' ? 'bg-amber-600 text-white' : 'bg-white shadow-sm'}`}>
                <p className="text-sm" style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-700 text-white flex items-center justify-center font-bold flex-shrink-0">S</div>
              <div className="max-w-md p-3 rounded-xl bg-white shadow-sm flex items-center">
                  <Spinner />
                  <span className="ml-2 text-sm text-gray-500">Thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="p-4 border-t bg-white">
        <div className="flex items-center gap-2">
          <textarea
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your question..."
            rows={1}
            className="w-full px-4 py-2 border border-gray-300 rounded-full shadow-sm focus:ring-amber-500 focus:border-amber-500 resize-none"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !currentMessage.trim()}
            className="bg-amber-700 text-white font-bold p-2.5 rounded-full hover:bg-amber-800 disabled:bg-amber-400 transition-colors duration-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AiChat;
