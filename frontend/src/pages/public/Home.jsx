import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Search,
  Bot,
  Sparkles,
  ShieldCheck,
  Tractor,
  TrendingUp,
  MapPin,
  Calendar,
  CheckCircle,
  ArrowRight,
  UserCheck,
  Star,
  Users
} from 'lucide-react';
import api from '../../services/api';
import ResourceCard from '../../components/ResourceCard';
import RequestModal from '../../components/RequestModal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const Home = () => {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const { addToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [featuredResources, setFeaturedResources] = useState([]);
  const [categories, setCategories] = useState([]);
  const [seasonalData, setSeasonalData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Request modal state
  const [requestTarget, setRequestTarget] = useState(null);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        const [resResponse, seasonResponse] = await Promise.all([
          api.get('/resources?limit=6&sortBy=rating'),
          api.get('/ai/seasonal-demand')
        ]);

        if (resResponse.data.success) {
          setFeaturedResources(resResponse.data.resources);
        }
        if (seasonResponse.data.success) {
          setSeasonalData(seasonResponse.data);
        }
      } catch (err) {
        console.warn('Home fetch error', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/search');
    }
  };

  const handleQuickLogin = async (email, password) => {
    try {
      await login(email, password);
      addToast(`Logged in as ${email}`, 'success');
    } catch (err) {
      // Toast already handled in auth context
    }
  };

  const quickCategories = [
    { name: 'Tractor', icon: '🚜', desc: '45-60 HP Tillage' },
    { name: 'Rotavator', icon: '⚙️', desc: 'Seedbed Pulverizers' },
    { name: 'Combine Harvester', icon: '🌾', desc: 'Rubber Track DC68' },
    { name: 'Sprayer', icon: '🌧️', desc: '400L Boom Sprayers' },
    { name: 'Seed Drill', icon: '🌱', desc: 'Auto Transplanters' },
    { name: 'Water Pump', icon: '💧', desc: '5HP Diesel Pumps' }
  ];

  return (
    <div>
      {/* HERO SECTION */}
      <section
        style={{
          background: 'radial-gradient(circle at 10% 20%, rgba(220, 252, 231, 0.8) 0%, rgba(254, 243, 199, 0.4) 50%, #ffffff 100%)',
          padding: '70px 0 60px',
          borderBottom: '1px solid #e2e8f0'
        }}
      >
        <div className="container">
          <div style={{ maxWidth: '840px', margin: '0 auto', textAlign: 'center' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 16px',
                borderRadius: '30px',
                background: '#dcfce7',
                border: '1px solid #bbf7d0',
                color: '#15803d',
                fontSize: '13px',
                fontWeight: '700',
                marginBottom: '20px'
              }}
            >
              <Sparkles size={16} /> Grounded AI & Verified Machinery Sharing Platform
            </div>

            <h1
              style={{
                fontSize: '44px',
                fontWeight: '800',
                color: '#0f172a',
                letterSpacing: '-1px',
                lineHeight: '1.2',
                marginBottom: '18px'
              }}
            >
              Share Agricultural Machinery & Optimize Farming with <span style={{ color: '#15803d' }}>Grounded AI</span>
            </h1>

            <p style={{ fontSize: '17px', color: '#475569', lineHeight: '1.6', marginBottom: '36px' }}>
              Connect with local verified equipment owners, get multi-factor smart matching for your exact crop & land area, and consult the AI Farmer Assistant backed by real database resources.
            </p>

            {/* Main Natural Language Search Bar */}
            <form
              onSubmit={handleSearchSubmit}
              style={{
                display: 'flex',
                alignItems: 'center',
                background: '#ffffff',
                padding: '8px 12px 8px 20px',
                borderRadius: '16px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
                border: '1px solid #cbd5e1',
                gap: '12px'
              }}
            >
              <Search size={22} color="#15803d" />
              <input
                type="text"
                placeholder="Try: '45 HP tractor in Madurai for paddy field preparation' or 'Sprayer in Salem'..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  fontSize: '15px',
                  fontFamily: 'inherit',
                  color: '#1e293b'
                }}
              />
              <button type="submit" className="btn btn-primary" style={{ padding: '12px 24px' }}>
                Search Machinery
              </button>
            </form>

            {/* Quick Filter Tags */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                flexWrap: 'wrap',
                marginTop: '20px'
              }}
            >
              <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>Popular Searches:</span>
              {['Tractor in Madurai', 'Rotavator for Paddy', 'Combine Harvester Coimbatore', 'Boom Sprayer'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => navigate(`/search?q=${encodeURIComponent(tag)}`)}
                  style={{
                    fontSize: '12px',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    color: '#334155',
                    cursor: 'pointer'
                  }}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* QUICK TEST ACCOUNTS DEMO SWITCHER */}
      <section style={{ padding: '24px 0', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
        <div className="container">
          <div
            style={{
              background: '#ffffff',
              padding: '16px 20px',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '14px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ background: '#dcfce7', padding: '6px', borderRadius: '8px', color: '#15803d' }}>
                <Users size={18} />
              </div>
              <div>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>
                  1-Click Test Accounts Quick Switcher:
                </span>
                <span style={{ fontSize: '12px', color: '#64748b', marginLeft: '6px' }}>
                  Instantly explore different roles with seeded real data
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                onClick={() => navigate('/login')}
                className="btn btn-sm"
                style={{ background: '#f8fafc', color: '#0f172a', border: '1px solid #cbd5e1', fontWeight: '600' }}
              >
                🔐 Sign In Portal
              </button>
              <button
                onClick={() => handleQuickLogin('farmer.murugan@agrishare.ai', 'Farmer@123Password')}
                className="btn btn-sm btn-secondary"
              >
                👤 User (Murugan - Madurai)
              </button>
              <button
                onClick={() => handleQuickLogin('farmer.selvam@agrishare.ai', 'Farmer@123Password')}
                className="btn btn-sm btn-secondary"
              >
                👤 User (Selvam - Cotton)
              </button>
              <button
                onClick={() => handleQuickLogin('owner.karthik@agrishare.ai', 'Owner@123Password')}
                className="btn btn-sm btn-accent"
              >
                🚜 User (Karthik - Machinery Fleet)
              </button>
              <button
                onClick={() => handleQuickLogin('953623104082@ritrjpm.ac.in', '9578615084')}
                className="btn btn-sm btn-primary"
                style={{ background: '#dc2626', borderColor: '#b91c1c' }}
              >
                🛡️ Platform Admin
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK CATEGORIES GRID */}
      <section style={{ padding: '60px 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>
              Explore Farm Equipment by Category
            </h2>
            <p style={{ color: '#64748b', fontSize: '15px' }}>
              Heavy machinery, precision implements, and water management equipment available for rental & sharing
            </p>
          </div>

          <div className="grid-3" style={{ gridTemplateColumns: 'repeat(6, 1fr)' }}>
            {quickCategories.map((cat) => (
              <div
                key={cat.name}
                onClick={() => navigate(`/search?category=${encodeURIComponent(cat.name)}`)}
                className="card"
                style={{
                  textAlign: 'center',
                  padding: '24px 16px',
                  cursor: 'pointer',
                  borderRadius: '16px',
                  transition: 'all 0.2s ease',
                  border: '1px solid #e2e8f0'
                }}
              >
                <div style={{ fontSize: '32px', marginBottom: '10px' }}>{cat.icon}</div>
                <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', marginBottom: '4px' }}>
                  {cat.name}
                </h4>
                <p style={{ fontSize: '11px', color: '#64748b' }}>{cat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED VERIFIED MACHINERY */}
      <section style={{ padding: '50px 0', background: '#ffffff', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#15803d', fontWeight: '700', fontSize: '13px' }}>
                <ShieldCheck size={18} /> LIVE PLATFORM DATABASE
              </div>
              <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', marginTop: '4px' }}>
                Verified Agricultural Equipment Near You
              </h2>
            </div>
            <Link to="/search" className="btn btn-outline-primary">
              View All Equipment <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid-3">
            {featuredResources.map((resource) => (
              <ResourceCard
                key={resource._id}
                resource={resource}
                onRequestClick={(r) => setRequestTarget(r)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* AI ASSISTANT & STAGE ANALYZER SHOWCASE */}
      <section style={{ padding: '70px 0', background: '#0f172a', color: '#ffffff' }}>
        <div className="container">
          <div className="grid-2" style={{ alignItems: 'center', gap: '48px' }}>
            <div>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(34, 197, 94, 0.2)',
                  color: '#22c55e',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '700',
                  marginBottom: '16px'
                }}
              >
                <Bot size={16} /> STRICTLY GROUNDED AI
              </span>

              <h2 style={{ fontSize: '34px', fontWeight: '800', lineHeight: '1.25', marginBottom: '16px', color: '#ffffff' }}>
                Intelligent Farmer Assistant Grounded in Real Data
              </h2>

              <p style={{ color: '#94a3b8', fontSize: '15px', lineHeight: '1.6', marginBottom: '24px' }}>
                Unlike general LLMs that hallucinate fake products or prices, AgriShare's AI operates strictly on candidate equipment from the database and your specific farm context (soil type, crop, acreage, and district).
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <CheckCircle size={20} color="#22c55e" />
                  <span style={{ fontSize: '14px', color: '#cbd5e1' }}>
                    Multi-factor smart matching with verified match reasons
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <CheckCircle size={20} color="#22c55e" />
                  <span style={{ fontSize: '14px', color: '#cbd5e1' }}>
                    Stage Analyzer decomposes crop operations into exact machinery categories
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <CheckCircle size={20} color="#22c55e" />
                  <span style={{ fontSize: '14px', color: '#cbd5e1' }}>
                    Double booking prevention and transparent pricing calculation
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '14px' }}>
                <Link to="/ai-assistant" className="btn btn-primary btn-lg">
                  <Bot size={18} /> Launch AI Assistant
                </Link>
                <Link to="/requirement-analyzer" className="btn btn-secondary btn-lg" style={{ background: '#1e293b', color: '#ffffff', borderColor: '#334155' }}>
                  <Sparkles size={18} /> Stage Analyzer
                </Link>
              </div>
            </div>

            {/* Interactive Preview Card */}
            <div
              style={{
                background: '#1e293b',
                padding: '28px',
                borderRadius: '20px',
                border: '1px solid #334155',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: '#15803d',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Bot size={20} color="#ffffff" />
                </div>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '14px', color: '#ffffff' }}>
                    AgriShare Assistant
                  </div>
                  <div style={{ fontSize: '11px', color: '#22c55e' }}>● Context-Aware & Active</div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div
                  style={{
                    background: '#0f172a',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    fontSize: '13px',
                    color: '#e2e8f0',
                    alignSelf: 'flex-end',
                    maxWidth: '85%'
                  }}
                >
                  "My 3.5 acre land in Madurai is ready for paddy puddling. What tractor & rotavator do I need?"
                </div>

                <div
                  style={{
                    background: '#334155',
                    padding: '14px 18px',
                    borderRadius: '12px',
                    fontSize: '13px',
                    color: '#f8fafc',
                    lineHeight: '1.5'
                  }}
                >
                  <p style={{ marginBottom: '8px' }}>
                    🌾 <strong>Agronomy Match for Madurai (Paddy):</strong>
                  </p>
                  <p style={{ fontSize: '12px', color: '#cbd5e1', marginBottom: '10px' }}>
                    For 3.5 acres of wetland puddling, a <strong>45 HP tractor with a 48-blade rotavator</strong> provides optimal soil tilth without subsoil compaction.
                  </p>
                  <div
                    style={{
                      background: '#1e293b',
                      padding: '10px',
                      borderRadius: '8px',
                      borderLeft: '3px solid #22c55e',
                      fontSize: '12px'
                    }}
                  >
                    🚜 <strong>Live Match:</strong> Mahindra 575 DI (45 HP) in Othakadai, Madurai • ₹850/hr (Rating: ★4.9)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEASONAL INSIGHTS BANNER */}
      {seasonalData && (
        <section style={{ padding: '40px 0', background: '#fffbeb', borderTop: '1px solid #fde68a' }}>
          <div className="container">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ background: '#f59e0b', color: '#ffffff', padding: '10px', borderRadius: '10px' }}>
                  <TrendingUp size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#78350f' }}>
                    Current Season: {seasonalData.currentSeasonInsight?.seasonName}
                  </h3>
                  <p style={{ fontSize: '13px', color: '#92400e' }}>
                    {seasonalData.currentSeasonInsight?.aiAnalysisNote}
                  </p>
                </div>
              </div>
              <Link to="/seasonal-trends" className="btn btn-accent btn-sm">
                View Seasonal Demand Trends
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Booking Request Modal */}
      <RequestModal
        resource={requestTarget}
        isOpen={!!requestTarget}
        onClose={() => setRequestTarget(null)}
        onSuccess={() => {
          navigate('/farmer/requests');
        }}
      />
    </div>
  );
};

export default Home;
