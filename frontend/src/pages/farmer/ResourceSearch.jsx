import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  MapPin,
  Sparkles,
  Tractor,
  SlidersHorizontal,
  Star,
  RefreshCw,
  X
} from 'lucide-react';
import api from '../../services/api';
import ResourceCard from '../../components/ResourceCard';
import RequestModal from '../../components/RequestModal';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { useAuth } from '../../context/AuthContext';

const ResourceSearch = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { profile } = useAuth();

  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requestTarget, setRequestTarget] = useState(null);

  // Filters State
  const [q, setQ] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [district, setDistrict] = useState(searchParams.get('district') || 'All');
  const [crop, setCrop] = useState(searchParams.get('crop') || 'All');
  const [condition, setCondition] = useState('All');
  const [sortBy, setSortBy] = useState('rating');
  const [withOperator, setWithOperator] = useState(false);
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  const categoriesList = [
    'All',
    'Tractor',
    'Rotavator',
    'Combine Harvester',
    'Sprayer',
    'Seed Drill',
    'Drip Irrigation Equipment',
    'Water Pump',
    'Agricultural Transport',
    'Storage Space'
  ];

  const districtsList = [
    'All',
    'Madurai',
    'Thirumangalam',
    'Thanjavur',
    'Coimbatore',
    'Salem',
    'Tiruchirappalli',
    'Dindigul',
    'Virudhunagar'
  ];

  const fetchResources = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (q) params.append('q', q);
      if (category && category !== 'All') params.append('category', category);
      if (district && district !== 'All') params.append('district', district);
      if (crop && crop !== 'All') params.append('crop', crop);
      if (condition && condition !== 'All') params.append('condition', condition);
      if (withOperator) params.append('withOperator', 'true');
      if (sortBy) params.append('sortBy', sortBy);

      const res = await api.get(`/resources?${params.toString()}`);
      if (res.data.success) {
        setResources(res.data.resources);
      }
    } catch (err) {
      console.error('Error fetching resources', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [category, district, crop, condition, withOperator, sortBy]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchResources();
  };

  const handleClearFilters = () => {
    setQ('');
    setCategory('All');
    setDistrict('All');
    setCrop('All');
    setCondition('All');
    setWithOperator(false);
    setSortBy('rating');
    navigate('/search');
  };

  return (
    <div className="container" style={{ padding: '30px 20px 60px' }}>
      {/* Search Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>
          Explore Agricultural Equipment & Machinery
        </h1>
        <p style={{ fontSize: '14px', color: '#64748b' }}>
          Real database listings with verified rates, driver availability, and crop compatibility
        </p>
      </div>

      {/* Main Search Bar */}
      <form onSubmit={handleSearchSubmit} style={{ marginBottom: '20px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            background: '#ffffff',
            padding: '8px 12px 8px 16px',
            borderRadius: '14px',
            border: '1px solid #cbd5e1',
            boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
            gap: '12px'
          }}
        >
          <Search size={20} color="#15803d" />
          <input
            type="text"
            className="form-control"
            placeholder="Search by equipment name, crop, operation, or location..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            style={{ border: 'none', padding: '6px 0', fontSize: '15px' }}
          />
          {q && (
            <button
              type="button"
              onClick={() => {
                setQ('');
                fetchResources();
              }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
            >
              <X size={16} />
            </button>
          )}
          <button type="submit" className="btn btn-primary btn-sm">
            Search
          </button>
        </div>
      </form>

      {/* Category Pills Horizon */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '12px',
          marginBottom: '20px',
          scrollbarWidth: 'none'
        }}
      >
        {categoriesList.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '600',
              whiteSpace: 'nowrap',
              border: category === cat ? '1px solid #15803d' : '1px solid #cbd5e1',
              background: category === cat ? '#15803d' : '#ffffff',
              color: category === cat ? '#ffffff' : '#475569',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Main Grid: Filters Sidebar + Results */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '28px' }}>
        {/* Filters Sidebar */}
        <div className="card" style={{ padding: '20px', height: 'fit-content' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <span style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Filter size={16} color="#15803d" /> Filters
            </span>
            <button
              onClick={handleClearFilters}
              style={{ background: 'none', border: 'none', fontSize: '12px', color: '#dc2626', cursor: 'pointer', fontWeight: '600' }}
            >
              Reset
            </button>
          </div>

          {/* District Filter */}
          <div className="form-group">
            <label className="form-label">Location / District</label>
            <select
              className="form-control"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
            >
              {districtsList.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Condition Filter */}
          <div className="form-group">
            <label className="form-label">Equipment Condition</label>
            <select
              className="form-control"
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
            >
              <option value="All">All Conditions</option>
              <option value="excellent">Excellent Condition</option>
              <option value="good">Good Condition</option>
              <option value="fair">Fair Condition</option>
            </select>
          </div>

          {/* Operator Toggle */}
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: '#334155' }}>
              <input
                type="checkbox"
                checked={withOperator}
                onChange={(e) => setWithOperator(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: '#15803d' }}
              />
              Includes Operator / Driver
            </label>
          </div>

          {/* Sort By */}
          <div className="form-group">
            <label className="form-label">Sort By</label>
            <select
              className="form-control"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="rating">Highest Rated</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="bookings">Most Booked</option>
              <option value="newest">Newly Listed</option>
            </select>
          </div>

          {/* AI Helper Banner */}
          <div
            style={{
              marginTop: '20px',
              padding: '14px',
              borderRadius: '12px',
              background: '#f0fdf4',
              border: '1px solid #bbf7d0'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '700', color: '#15803d', marginBottom: '4px' }}>
              <Sparkles size={14} /> Need Matching Advice?
            </div>
            <p style={{ fontSize: '11px', color: '#475569', lineHeight: '1.4', marginBottom: '10px' }}>
              Use our AI Matchmaker to calculate exact acre & crop compatibility.
            </p>
            <button
              onClick={() => navigate('/requirement-analyzer')}
              className="btn btn-primary btn-sm"
              style={{ width: '100%', fontSize: '11px' }}
            >
              Run Stage Analyzer
            </button>
          </div>
        </div>

        {/* Results Area */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ fontSize: '14px', color: '#64748b' }}>
              Showing <strong>{resources.length}</strong> available agricultural resources
            </div>
          </div>

          {loading ? (
            <LoadingSpinner message="Searching verified equipment..." minHeight="300px" />
          ) : resources.length === 0 ? (
            <EmptyState
              title="No Equipment Matches Found"
              description="Try adjusting your search keywords, district filter, or category pills."
              actionText="Reset All Filters"
              onActionClick={handleClearFilters}
            />
          ) : (
            <div className="grid-3" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
              {resources.map((resource) => (
                <ResourceCard
                  key={resource._id}
                  resource={resource}
                  onRequestClick={(r) => setRequestTarget(r)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

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

export default ResourceSearch;
