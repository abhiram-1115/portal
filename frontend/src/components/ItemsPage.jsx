import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { itemsAPI } from '../services/api';

const ItemsPage = ({ defaultCategory = 'lost' }) => {
  const { isAuthenticated } = useAuth();
  const [category, setCategory] = useState(defaultCategory);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [claimingItem, setClaimingItem] = useState(null);
  const [showClaimed, setShowClaimed] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await itemsAPI.getItems();
      setItems(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching items:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async (itemId) => {
    if (!isAuthenticated) {
      alert('Please login to claim items');
      return;
    }

    if (!window.confirm('Are you sure you want to claim this item? This action cannot be undone.')) {
      return;
    }

    try {
      setClaimingItem(itemId);
      await itemsAPI.claimItem(itemId);
      // Refresh items after claiming
      await fetchItems();
      alert('Item claimed successfully!');
    } catch (err) {
      alert(err.message || 'Failed to claim item');
    } finally {
      setClaimingItem(null);
    }
  };

  const filteredItems = items.filter(item => {
    const categoryMatch = item.category === category;
    if (showClaimed) {
      return categoryMatch && item.status === 'claimed';
    }
    return categoryMatch && item.status === 'approved';
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Lost & Found Portal
          </h1>
          
          {/* Toggle Switch */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <span className={`text-lg font-medium ${category === 'lost' ? 'text-blue-600' : 'text-gray-500'}`}>
              Lost Items
            </span>
            <button
              onClick={() => setCategory(category === 'lost' ? 'found' : 'lost')}
              className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                category === 'found' ? 'bg-blue-600' : 'bg-gray-300'
              }`}
              aria-label="Toggle between lost and found items"
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  category === 'found' ? 'translate-x-9' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-lg font-medium ${category === 'found' ? 'text-blue-600' : 'text-gray-500'}`}>
              Found Items
            </span>
          </div>

          <p className="text-center text-gray-600 mb-4">
            {category === 'lost' 
              ? 'Browse items that have been reported as lost' 
              : 'Browse items that have been reported as found'}
          </p>
          
          <div className="flex justify-center items-center gap-4 mb-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={showClaimed}
                onChange={(e) => setShowClaimed(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Show claimed items</span>
            </label>
          </div>
          
          {isAuthenticated && (
            <div className="text-center">
              <Link
                to="/add-item"
                className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md shadow-sm transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Report {category === 'lost' ? 'Lost' : 'Found'} Item
              </Link>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            <p className="font-medium">Error loading items</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Items Grid */}
        {!loading && !error && (
          <>
            {filteredItems.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-gray-400 text-6xl mb-4">📦</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  {showClaimed 
                    ? `No claimed ${category} items found`
                    : `No ${category} items found`}
                </h3>
                <p className="text-gray-500">
                  {showClaimed
                    ? `No claimed ${category} items yet.`
                    : category === 'lost' 
                    ? 'No lost items have been reported yet.' 
                    : 'No found items have been reported yet.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.map((item) => (
                  <div
                    key={item._id}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                  >
                    {/* Item Image */}
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
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Item Details */}
                    <div className="p-5">
                      <div className="mb-3 flex items-center justify-between">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          item.category === 'lost' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {item.category === 'lost' ? 'Lost' : 'Found'}
                        </span>
                        {item.status === 'claimed' && (
                          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
                            ✓ Claimed
                          </span>
                        )}
                      </div>

                      <p className="text-gray-800 mb-4 line-clamp-3">
                        {item.description}
                      </p>

                      <div className="border-t pt-4 space-y-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <span className="truncate">{item.contactDetails?.email}</span>
                        </div>

                        <div className="flex items-center text-sm text-gray-500">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>{formatDate(item.createdAt)}</span>
                        </div>

                        {item.status === 'claimed' && item.claimedAt && (
                          <div className="flex items-center text-sm text-purple-600">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Claimed on {formatDate(item.claimedAt)}</span>
                          </div>
                        )}
                      </div>

                      {/* Claim Button */}
                      {item.status === 'approved' && isAuthenticated && (
                        <div className="mt-4 pt-4 border-t">
                          <button
                            onClick={() => handleClaim(item._id)}
                            disabled={claimingItem === item._id}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                          >
                            {claimingItem === item._id ? (
                              <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Claiming...
                              </>
                            ) : (
                              <>
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Claim This Item
                              </>
                            )}
                          </button>
                        </div>
                      )}

                      {item.status === 'approved' && !isAuthenticated && (
                        <div className="mt-4 pt-4 border-t">
                          <Link
                            to="/login"
                            className="block w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md text-center transition-colors"
                          >
                            Login to Claim
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ItemsPage;

