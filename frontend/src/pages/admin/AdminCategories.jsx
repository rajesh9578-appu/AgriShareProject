import React, { useState, useEffect } from 'react';
import { Layers, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useToast } from '../../context/ToastContext';

const AdminCategories = () => {
  const { addToast } = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [adding, setAdding] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/categories');
      if (res.data.success) {
        setCategories(res.data.categories);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setAdding(true);
      const res = await api.post('/admin/categories', {
        name: name.trim(),
        description: description.trim()
      });
      if (res.data.success) {
        addToast('New category created!', 'success');
        setName('');
        setDescription('');
        fetchCategories();
      }
    } catch (err) {
      addToast('Failed to create category', 'error');
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      const res = await api.delete(`/admin/categories/${id}`);
      if (res.data.success) {
        addToast('Category deleted', 'info');
        setCategories((prev) => prev.filter((c) => c._id !== id));
      }
    } catch (err) {
      addToast('Failed to delete category', 'error');
    }
  };

  return (
    <div className="container" style={{ padding: '30px 20px 60px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a' }}>
          Equipment Category Taxonomy ({categories.length})
        </h1>
        <p style={{ fontSize: '13px', color: '#64748b' }}>
          Configure valid agricultural equipment categories and supported farm operations
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '28px' }}>
        {/* Create Form */}
        <div className="card" style={{ height: 'fit-content' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '16px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={18} color="#15803d" /> Add New Category
          </h3>

          <form onSubmit={handleAddCategory}>
            <div className="form-group">
              <label className="form-label">Category Name *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Drone Sprayer, Ridge Maker"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-control"
                placeholder="Describe typical operations and attachments..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <button type="submit" disabled={adding} className="btn btn-primary" style={{ width: '100%' }}>
              {adding ? 'Creating...' : '+ Create Category'}
            </button>
          </form>
        </div>

        {/* Categories List */}
        <div className="card">
          <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '16px', color: '#0f172a' }}>
            Active Categories
          </h3>

          {loading ? (
            <LoadingSpinner message="Loading categories..." />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {categories.map((c) => (
                <div
                  key={c._id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '14px', color: '#0f172a' }}>
                      {c.name}
                    </div>
                    {c.description && (
                      <div style={{ fontSize: '12px', color: '#64748b' }}>{c.description}</div>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(c._id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626' }}
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCategories;
