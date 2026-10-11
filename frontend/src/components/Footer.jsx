import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, ShieldCheck, Heart, Sparkles, MapPin, Phone, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer
      style={{
        background: '#0f172a',
        color: '#94a3b8',
        padding: '60px 0 30px',
        borderTop: '1px solid #1e293b',
        marginTop: '60px'
      }}
    >
      <div className="container">
        <div className="grid-4" style={{ marginBottom: '40px' }}>
          {/* Col 1 */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff'
                }}
              >
                <Sprout size={20} />
              </div>
              <span style={{ fontSize: '18px', fontWeight: '800', color: '#ffffff' }}>
                Agri<span style={{ color: '#22c55e' }}>Share</span>
              </span>
            </div>
            <p style={{ fontSize: '13px', lineHeight: '1.6', color: '#94a3b8', marginBottom: '16px' }}>
              Empowering farmers with smart agricultural machinery sharing, AI-driven agronomy matching, and transparent booking management.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#22c55e' }}>
              <ShieldCheck size={16} /> 100% Verified Equipment & Real DB Grounding
            </div>
          </div>

          {/* Col 2 */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '15px', marginBottom: '16px', fontWeight: '700' }}>
              AI Farm Tools
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
              <li>
                <Link to="/ai-assistant" style={{ color: '#94a3b8', textDecoration: 'none' }}>
                  🌾 AI Farmer Assistant
                </Link>
              </li>
              <li>
                <Link to="/requirement-analyzer" style={{ color: '#94a3b8', textDecoration: 'none' }}>
                  ⚙️ Stage & Machinery Analyzer
                </Link>
              </li>
              <li>
                <Link to="/search" style={{ color: '#94a3b8', textDecoration: 'none' }}>
                  🔍 Location-Aware Search
                </Link>
              </li>
              <li>
                <Link to="/seasonal-trends" style={{ color: '#94a3b8', textDecoration: 'none' }}>
                  📊 Seasonal Demand Trends
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '15px', marginBottom: '16px', fontWeight: '700' }}>
              Sharing Network
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
              <li>
                <Link to="/search?category=Tractor" style={{ color: '#94a3b8', textDecoration: 'none' }}>
                  Tractors & Tillage (45-60 HP)
                </Link>
              </li>
              <li>
                <Link to="/search?category=Combine+Harvester" style={{ color: '#94a3b8', textDecoration: 'none' }}>
                  Combine Harvesters
                </Link>
              </li>
              <li>
                <Link to="/search?category=Sprayer" style={{ color: '#94a3b8', textDecoration: 'none' }}>
                  Boom & Drone Sprayers
                </Link>
              </li>
              <li>
                <Link to="/search?category=Drip+Irrigation" style={{ color: '#94a3b8', textDecoration: 'none' }}>
                  Micro Irrigation & Pumps
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4 */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '15px', marginBottom: '16px', fontWeight: '700' }}>
              Regional Hubs
            </h4>
            <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '10px' }}>
              <MapPin size={14} style={{ display: 'inline', marginRight: '6px' }} />
              Madurai, Thanjavur, Coimbatore, Salem, Tiruchirappalli
            </p>
            <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '10px' }}>
              <Phone size={14} style={{ display: 'inline', marginRight: '6px' }} />
              Toll-Free Support: 1800-AGRI-SHARE
            </p>
            <p style={{ fontSize: '13px', color: '#94a3b8' }}>
              <Mail size={14} style={{ display: 'inline', marginRight: '6px' }} />
              support@agrishare.ai
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            borderTop: '1px solid #1e293b',
            paddingTop: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            fontSize: '12px'
          }}
        >
          <div>
            © {new Date().getFullYear()} AgriShare Platform. Production-grade agricultural resource intelligence.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            Built with <Heart size={14} color="#ef4444" style={{ margin: '0 2px' }} /> for Sustainable Farming
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
