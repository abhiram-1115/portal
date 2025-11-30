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
  const [searchQuery, setSearchQuery] = useState('');

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

  // Calculate counts
  const lostItemsCount = items.filter(item => item.category === 'lost' && item.status === 'approved').length;
  const foundItemsCount = items.filter(item => item.category === 'found' && item.status === 'approved').length;

  const filteredItems = items.filter(item => {
    const categoryMatch = item.category === category;
    const statusMatch = showClaimed 
      ? item.status === 'claimed' 
      : item.status === 'approved';
    
    // Search filter
    const searchMatch = searchQuery === '' || 
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.contactDetails?.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return categoryMatch && statusMatch && searchMatch;
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
    <div className="min-h-screen bg-gray-50">
      {/* Blue Header Banner */}
      <div className="bg-blue-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Box Icon */}
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h1 className="text-4xl font-bold">Lost & Found</h1>
            </div>
            
            {/* Count Indicators */}
            <div className="flex items-center gap-4">
              <div className="bg-blue-500 px-4 py-2 rounded-full flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
                <span className="font-medium">{lostItemsCount} Lost Items</span>
              </div>
              <div className="bg-blue-500 px-4 py-2 rounded-full flex items-center gap-2">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span className="font-medium">{foundItemsCount} Found Items</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search items by name, category, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
            />
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex justify-center gap-2 mb-8">
          <button
            onClick={() => setCategory('lost')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              category === 'lost'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Lost Items ({lostItemsCount})
          </button>
          <button
            onClick={() => setCategory('found')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              category === 'found'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Found Items ({foundItemsCount})
          </button>
        </div>

        {/* Show Claimed Toggle */}
        <div className="flex justify-center items-center gap-4 mb-6">
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

        {/* Add Item Button */}
        {isAuthenticated && (
          <div className="text-center mb-6">
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

