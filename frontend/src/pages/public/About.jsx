import React from 'react';
import { Sprout, ShieldCheck, Bot, Repeat, Users, Award, CheckCircle, Database } from 'lucide-react';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <div className="container" style={{ padding: '60px 20px' }}>
      {/* Title */}
      <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 50px' }}>
        <span className="badge badge-verified" style={{ marginBottom: '12px' }}>
          ABOUT THE PLATFORM
        </span>
        <h1 style={{ fontSize: '38px', fontWeight: '800', color: '#0f172a', marginBottom: '16px' }}>
          Empowering Indian Farmers through Collaborative Agricultural Intelligence
        </h1>
        <p style={{ fontSize: '16px', color: '#64748b', lineHeight: '1.6' }}>
          AgriShare connects marginal and smallholder farmers with high-cost agricultural machinery owners, supported by Grounded AI agronomic recommendation models.
        </p>
      </div>

      {/* 3 Core Pillars */}
      <div className="grid-3" style={{ marginBottom: '60px' }}>
        <div className="card" style={{ padding: '32px 24px', textAlign: 'center' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#dcfce7', color: '#15803d', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
            <Repeat size={28} />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '10px' }}>
            Unified User Capabilities
          </h3>
          <p style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.5' }}>
            Every registered user can seamlessly act as both Resource Seeker (rent machinery) and Resource Provider (list equipment) with zero role switching required.
          </p>
        </div>

        <div className="card" style={{ padding: '32px 24px', textAlign: 'center' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#e0f2fe', color: '#0284c7', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
            <Database size={28} />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '10px' }}>
            Zero-Hallucination Grounding
          </h3>
          <p style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.5' }}>
            Our AI layer strictly searches candidate items from MongoDB. It never invents fake prices, contact numbers, or non-existent equipment.
          </p>
        </div>

        <div className="card" style={{ padding: '32px 24px', textAlign: 'center' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#fef3c7', color: '#d97706', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
            <ShieldCheck size={28} />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '10px' }}>
            Trust & Verification Network
          </h3>
          <p style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.5' }}>
            Admin moderation, verified badges, real-time OTP security, and verified reviews after every completed booking build long-term trust.
          </p>
        </div>
      </div>

      {/* Tech Stack Callout */}
      <div
        style={{
          background: '#0f172a',
          color: '#ffffff',
          borderRadius: '20px',
          padding: '40px',
          marginBottom: '60px'
        }}
      >
        <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#ffffff', marginBottom: '16px' }}>
          Production Architectural Stack
        </h2>
        <div className="grid-4" style={{ marginTop: '24px' }}>
          <div>
            <div style={{ fontSize: '13px', color: '#22c55e', fontWeight: '700' }}>FRONTEND</div>
            <div style={{ fontSize: '16px', fontWeight: '600', color: '#ffffff', marginTop: '4px' }}>
              React 18 + Modern CSS Tokens + Responsive Grid
            </div>
          </div>
          <div>
            <div style={{ fontSize: '13px', color: '#22c55e', fontWeight: '700' }}>BACKEND</div>
            <div style={{ fontSize: '16px', fontWeight: '600', color: '#ffffff', marginTop: '4px' }}>
              Node.js + Express REST API Architecture
            </div>
          </div>
          <div>
            <div style={{ fontSize: '13px', color: '#22c55e', fontWeight: '700' }}>DATABASE</div>
            <div style={{ fontSize: '16px', fontWeight: '600', color: '#ffffff', marginTop: '4px' }}>
              MongoDB + Mongoose 2dsphere Geospatial Indices
            </div>
          </div>
          <div>
            <div style={{ fontSize: '13px', color: '#22c55e', fontWeight: '700' }}>AI & SECURITY</div>
            <div style={{ fontSize: '16px', fontWeight: '600', color: '#ffffff', marginTop: '4px' }}>
              Gemini AI / Hybrid RAG + JWT + Email OTP
            </div>
          </div>
        </div>
      </div>

      {/* Call to action */}
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <h3 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '12px' }}>
          Ready to experience the platform?
        </h3>
        <div style={{ display: 'flex', gap: '14px', justifyContent: 'center' }}>
          <Link to="/register" className="btn btn-primary">
            Register as a Farmer
          </Link>
          <Link to="/search" className="btn btn-secondary">
            Browse Equipment Listings
          </Link>
        </div>
      </div>
    </div>
  );
};

export default About;
