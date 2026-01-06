import React, { useState, useRef, useEffect } from 'react';
import './GustiChatbot.css';

export default function GustiChatbot({ isOpen, onClose }) {
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: '👋 Salut! Sunt Gusti, asistentul tău virtual SmartDepot! Cu ce te pot ajuta astăzi?',
            timestamp: new Date()
        }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // Auto-scroll la ultimul mesaj
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessage = async () => {
        if (!inputMessage.trim() || isLoading) return;

        const userMessage = {
            role: 'user',
            content: inputMessage,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsLoading(true);

        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch('http://localhost:3002/api/chat/gusti', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    message: inputMessage,
                    conversationHistory: messages.slice(-10) // Ultimele 10 mesaje pentru context
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Eroare la comunicare cu Gusti');
            }

            const assistantMessage = {
                role: 'assistant',
                content: data.response,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, assistantMessage]);

        } catch (error) {
            console.error('Eroare chat:', error);
            const errorMessage = {
                role: 'assistant',
                content: '😔 Scuze! Am întâmpinat o problemă. Te rog încearcă din nou sau contactează-ne la eshop2025is@gmail.com',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    // Quick replies predefinite
    const quickReplies = [
        '📦 Cum urmăresc comanda?',
        '🔄 Vreau să returnez un produs',
        '💳 Ce metode de plată aveți?',
        '🚚 Când primesc coletul?'
    ];

    const handleQuickReply = (reply) => {
        setInputMessage(reply);
    };

    if (!isOpen) return null;

    return (
        <div className="chatbot-overlay" onClick={onClose}>
            <div className="chatbot-container" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="chatbot-header">
                    <div className="chatbot-avatar">
                        <span className="avatar-emoji">🤖</span>
                        <span className="online-indicator"></span>
                    </div>
                    <div className="chatbot-info">
                        <h3>Gusti</h3>
                        <p className="status">Asistent virtual • Online</p>
                    </div>
                    <button className="close-chatbot" onClick={onClose}>
                        ✕
                    </button>
                </div>

                {/* Messages Area */}
                <div className="chatbot-messages">
                    {messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`message ${msg.role === 'user' ? 'user-message' : 'assistant-message'}`}
                        >
                            {msg.role === 'assistant' && (
                                <div className="message-avatar">🤖</div>
                            )}
                            <div className="message-bubble">
                                <p>{msg.content}</p>
                                <span className="message-time">
                                    {msg.timestamp.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                            {msg.role === 'user' && (
                                <div className="message-avatar user-avatar">👤</div>
                            )}
                        </div>
                    ))}

                    {isLoading && (
                        <div className="message assistant-message">
                            <div className="message-avatar">🤖</div>
                            <div className="message-bubble typing-indicator">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Quick Replies */}
                {messages.length === 1 && (
                    <div className="quick-replies">
                        <p className="quick-replies-title">Sugestii rapide:</p>
                        <div className="quick-replies-buttons">
                            {quickReplies.map((reply, index) => (
                                <button
                                    key={index}
                                    className="quick-reply-btn"
                                    onClick={() => handleQuickReply(reply)}
                                >
                                    {reply}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Input Area */}
                <div className="chatbot-input-area">
                    <textarea
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Scrie mesajul tău aici..."
                        rows="1"
                        disabled={isLoading}
                    />
                    <button
                        className="send-btn"
                        onClick={sendMessage}
                        disabled={!inputMessage.trim() || isLoading}
                    >
                        <i className="fas fa-paper-plane"></i>
                    </button>
                </div>

                {/* Powered by */}
                <div className="chatbot-footer">
                    <span>Powered by OpenAI GPT-3.5</span>
                </div>
            </div>
        </div>
    );
}