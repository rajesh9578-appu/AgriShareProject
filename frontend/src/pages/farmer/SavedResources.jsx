import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Tractor, Trash2 } from 'lucide-react';
import api from '../../services/api';
import ResourceCard from '../../components/ResourceCard';
import RequestModal from '../../components/RequestModal';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { useToast } from '../../context/ToastContext';

const SavedResources = () => {
  const { addToast } = useToast();
  const [savedItems, setSavedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requestTarget, setRequestTarget] = useState(null);

  const fetchSaved = async () => {
    try {
      setLoading(true);
      const res = await api.get('/saved-resources');
      if (res.data.success) {
        setSavedItems(res.data.savedResources);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSaved();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading your bookmarked resources..." minHeight="60vh" />;
  }

  return (
    <div className="container" style={{ padding: '30px 20px 60px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a' }}>
          Saved Machinery Bookmarks
        </h1>
        <p style={{ fontSize: '13px', color: '#64748b' }}>
          Quickly access equipment you shortlisted for upcoming farming operations
        </p>
      </div>

      {savedItems.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="No Saved Resources"
          description="Click the bookmark icon on any equipment card to save it for easy access later."
          actionText="Explore Equipment"
          actionLink="/search"
        />
      ) : (
        <div className="grid-3">
          {savedItems.map((item) => (
            <ResourceCard
              key={item._id}
              resource={item.resource}
              onRequestClick={(r) => setRequestTarget(r)}
            />
          ))}
        </div>
      )}

      <RequestModal
        resource={requestTarget}
        isOpen={!!requestTarget}
        onClose={() => setRequestTarget(null)}
        onSuccess={() => {
          fetchSaved();
        }}
      />
    </div>
  );
};

export default SavedResources;
