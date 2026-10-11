import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  Bot,
  Send,
  Sparkles,
  User,
  Plus,
  Trash2,
  Tractor,
  MessageSquare,
  ShieldCheck,
  Calendar,
  ArrowRight
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/LoadingSpinner';

const AIAssistant = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { addToast } = useToast();

  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef(null);

  const initialQuery = searchParams.get('initialMessage');

  // Fetch all conversation sessions
  const fetchConversations = async () => {
    try {
      setLoading(true);
      const res = await api.get('/ai/conversations');
      if (res.data.success) {
        setConversations(res.data.conversations);
        if (res.data.conversations.length > 0 && !activeConversationId && !initialQuery) {
          loadConversation(res.data.conversations[0]._id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadConversation = async (convId) => {
    try {
      setActiveConversationId(convId);
      const res = await api.get(`/ai/conversations/${convId}`);
      if (res.data.success) {
        setMessages(res.data.conversation.messages);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  // Handle query parameter trigger
  useEffect(() => {
    if (initialQuery && !activeConversationId) {
      handleSendMessage(initialQuery);
    }
  }, [initialQuery]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const handleSendMessage = async (textToSend = null) => {
    const text = textToSend || inputMessage;
    if (!text || !text.trim()) return;

    if (!user) {
      addToast('Please login to chat with the AI Farmer Assistant.', 'warning');
      navigate('/login');
      return;
    }

    const userMsg = {
      role: 'user',
      content: text.trim(),
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setSending(true);

    try {
      const res = await api.post('/ai/assistant/chat', {
        message: text.trim(),
        conversationId: activeConversationId
      });

      if (res.data.success) {
        setActiveConversationId(res.data.conversationId);
        const assistantMsg = {
          role: 'assistant',
          content: res.data.content,
          matchedResources: res.data.matchedResources || [],
          suggestedActions: res.data.suggestedActions || [],
          timestamp: new Date()
        };
        setMessages((prev) => [...prev, assistantMsg]);

        // Refresh conversation list titles
        fetchConversations();
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Error communicating with AI Assistant.';
      addToast(errMsg, 'error');
    } finally {
      setSending(false);
    }
  };

  const handleStartNewChat = () => {
    setActiveConversationId(null);
    setMessages([]);
  };

  const handleDeleteConversation = async (e, convId) => {
    e.stopPropagation();
    try {
      await api.delete(`/ai/conversations/${convId}`);
      addToast('Conversation removed', 'info');
      if (activeConversationId === convId) {
        handleStartNewChat();
      }
      fetchConversations();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container" style={{ padding: '30px 20px 60px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '24px', minHeight: '75vh' }}>
        {/* Sidebar: Chat History */}
        <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', height: '100%' }}>
          <button
            onClick={handleStartNewChat}
            className="btn btn-primary btn-sm"
            style={{ width: '100%', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
          >
            <Plus size={16} /> New Consultation
          </button>

          <div style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '10px' }}>
            Previous Consultations
          </div>

          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {conversations.length === 0 ? (
              <p style={{ fontSize: '12px', color: '#94a3b8', textAlign: 'center', marginTop: '20px' }}>
                No past consultations yet.
              </p>
            ) : (
              conversations.map((c) => (
                <div
                  key={c._id}
                  onClick={() => loadConversation(c._id)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '8px',
                    background: activeConversationId === c._id ? '#f0fdf4' : '#f8fafc',
                    border: activeConversationId === c._id ? '1px solid #bbf7d0' : '1px solid #e2e8f0',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '13px'
                  }}
                >
                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '180px' }}>
                    <div style={{ fontWeight: '600', color: activeConversationId === c._id ? '#15803d' : '#1e293b' }}>
                      {c.title}
                    </div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                      {new Date(c.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleDeleteConversation(e, c._id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '4px' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Farm Context Snapshot */}
          {profile && (
            <div
              style={{
                marginTop: '16px',
                padding: '12px',
                borderRadius: '10px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                fontSize: '11px',
                color: '#64748b'
              }}
            >
              <div style={{ fontWeight: '700', color: '#0f172a', marginBottom: '4px' }}>
                🌾 Current Farm Context:
              </div>
              <div>District: <strong>{profile.district}</strong></div>
              <div>Land: <strong>{profile.landArea} {profile.landUnit}</strong> ({profile.soilType})</div>
              <div>Crops: <strong>{profile.cropsCultivated?.join(', ')}</strong></div>
            </div>
          )}
        </div>

        {/* Main Chat Interface */}
        <div className="card" style={{ padding: '0', display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
          {/* Chat Header */}
          <div
            style={{
              padding: '16px 20px',
              borderBottom: '1px solid #e2e8f0',
              background: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff'
                }}
              >
                <Bot size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>
                  AgriShare AI Farmer Assistant
                </h3>
                <span style={{ fontSize: '11px', color: '#15803d', fontWeight: '600' }}>
                  ● 100% Grounded in Live Database Resources
                </span>
              </div>
            </div>

            <span className="badge badge-verified">
              <ShieldCheck size={12} /> Zero Hallucination
            </span>
          </div>

          {/* Messages Stream */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '24px', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {messages.length === 0 ? (
              <div style={{ textAlign: 'center', margin: 'auto', maxWidth: '480px' }}>
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: '#dcfce7',
                    color: '#15803d',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '16px'
                  }}
                >
                  <Sparkles size={32} />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>
                  How can I assist your farm today?
                </h3>
                <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '24px', lineHeight: '1.5' }}>
                  Ask about equipment sizing, soil preparation requirements, pest spraying schedules, or discover matching tractors near your village.
                </p>

                {/* Prompt Starter Chips */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    'My 3.5 acre field is ready for paddy puddling. What tractor & rotavator do I need?',
                    'Find available boom sprayers for cotton in Madurai.',
                    'What machinery is required for sugarcane furrowing?'
                  ].map((p) => (
                    <button
                      key={p}
                      onClick={() => handleSendMessage(p)}
                      style={{
                        padding: '10px 14px',
                        borderRadius: '10px',
                        background: '#ffffff',
                        border: '1px solid #cbd5e1',
                        color: '#334155',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      💡 "{p}"
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((m, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: m.role === 'user' ? 'flex-end' : 'flex-start'
                  }}
                >
                  <div
                    style={{
                      maxWidth: '85%',
                      padding: '14px 18px',
                      borderRadius: '16px',
                      fontSize: '14px',
                      lineHeight: '1.6',
                      background: m.role === 'user' ? '#15803d' : '#ffffff',
                      color: m.role === 'user' ? '#ffffff' : '#1e293b',
                      border: m.role === 'user' ? 'none' : '1px solid #e2e8f0',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
                      whiteSpace: 'pre-line'
                    }}
                  >
                    {m.content}

                    {/* Grounded Real Resource Recommendations */}
                    {m.matchedResources && m.matchedResources.length > 0 && (
                      <div
                        style={{
                          marginTop: '14px',
                          paddingTop: '12px',
                          borderTop: '1px solid #e2e8f0',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px'
                        }}
                      >
                        <div style={{ fontSize: '12px', fontWeight: '700', color: '#15803d', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Tractor size={14} /> Available Database Equipment Matches:
                        </div>
                        {m.matchedResources.map((res) => (
                          <div
                            key={res.resourceId}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '8px 12px',
                              background: '#f8fafc',
                              borderRadius: '8px',
                              border: '1px solid #cbd5e1'
                            }}
                          >
                            <div>
                              <div style={{ fontWeight: '700', fontSize: '13px', color: '#0f172a' }}>
                                {res.name}
                              </div>
                              <div style={{ fontSize: '11px', color: '#64748b' }}>
                                {res.location} • ₹{res.price} / {res.unit}
                              </div>
                            </div>
                            <Link
                              to={`/resources/${res.resourceId}`}
                              className="btn btn-primary btn-sm"
                              style={{ padding: '4px 8px', fontSize: '11px' }}
                            >
                              View <ArrowRight size={12} />
                            </Link>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <span style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px' }}>
                    {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            )}

            {sending && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#15803d', fontSize: '13px', padding: '10px' }}>
                <Bot size={18} className="spinner-icon" style={{ animation: 'spin 1s linear infinite' }} />
                <span>Consulting agronomy models & verifying platform database...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            style={{
              padding: '16px 20px',
              background: '#ffffff',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              gap: '10px'
            }}
          >
            <input
              type="text"
              className="form-control"
              placeholder="Ask about farm machinery, crop cycles, or equipment availability..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={sending}
              style={{ fontSize: '14px' }}
            />
            <button
              type="submit"
              disabled={sending || !inputMessage.trim()}
              className="btn btn-primary"
              style={{ padding: '10px 20px' }}
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
