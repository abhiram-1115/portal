import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { itemsAPI } from '../services/api';

const AdminPanel = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('pending'); // pending, approved, claimed

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!isAdmin) {
      navigate('/');
      return;
    }
    fetchAllItems();
  }, [isAuthenticated, isAdmin, navigate]);

  const fetchAllItems = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await itemsAPI.getAllItems();
      setItems(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (itemId) => {
    try {
      await itemsAPI.approveItem(itemId);
      setItems(items.map(item => 
        item._id === itemId ? { ...item, status: 'approved' } : item
      ));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }
    try {
      await itemsAPI.deleteItem(itemId);
      setItems(items.filter(item => item._id !== itemId));
    } catch (err) {
      setError(err.message);
    }
  };

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  const filteredItems = items.filter(item => item.status === filter);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Admin Panel</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Filter Tabs */}
        <div className="mb-6 flex gap-4 border-b">
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 font-medium ${
              filter === 'pending'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Pending ({items.filter(i => i.status === 'pending').length})
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-4 py-2 font-medium ${
              filter === 'approved'
                ? 'border-b-2 border-green-600 text-green-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Approved ({items.filter(i => i.status === 'approved').length})
          </button>
          <button
            onClick={() => setFilter('claimed')}
            className={`px-4 py-2 font-medium ${
              filter === 'claimed'
                ? 'border-b-2 border-purple-600 text-purple-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Claimed ({items.filter(i => i.status === 'claimed').length})
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500">No {filter} items found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item._id}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                <div className="aspect-video bg-gray-200 overflow-hidden">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl.startsWith('http')
                        ? item.imageUrl
                        : item.imageUrl.startsWith('/')
                        ? `http://localhost:5000${item.imageUrl}`
                        : `http://localhost:5000/uploads/${item.imageUrl}`}
                      alt={item.description}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      item.status === 'approved' ? 'bg-green-100 text-green-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {item.status}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      item.category === 'lost' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {item.category}
                    </span>
                  </div>
                  <p className="text-gray-800 mb-4 line-clamp-3">{item.description}</p>
                  <p className="text-sm text-gray-600 mb-4">{item.contactDetails?.email}</p>
                  <div className="flex gap-2">
                    {item.status === 'pending' && (
                      <button
                        onClick={() => handleApprove(item._id)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm font-medium"
                      >
                        Approve
                      </button>
                    )}
                    {item.status === 'claimed' && (
                      <div className="flex-1 text-sm text-purple-600 font-medium">
                        ✓ Claimed
                      </div>
                    )}
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                  {item.claimedAt && (
                    <p className="text-xs text-gray-500 mt-2">
                      Claimed on {new Date(item.claimedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;

