import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [activeTab, setActiveTab] = useState('lost');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    // Fetch items from API
    const fetchItems = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/items');
        const data = await response.json();
        // Only show approved items
        const approvedItems = data.filter(item => item.status === 'approved');
        setItems(approvedItems);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching items:', error);
        setLoading(false);
      }
    };
    
    fetchItems();
  }, []);

  useEffect(() => {
    // Filter items based on active tab and search query
    let filtered = items.filter(item => item.type === activeTab);
    
    if (searchQuery) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredItems(filtered);
  }, [activeTab, searchQuery, items]);

  const handleSearchChange = (e) => {
    setIsSearching(true);
    setSearchQuery(e.target.value);
    setTimeout(() => setIsSearching(false), 300);
  };

  const lostCount = items.filter(item => item.type === 'lost').length;
  const foundCount = items.filter(item => item.type === 'found').length;

  const handleAddItemClick = () => {
    if (!isAuthenticated) {
      // Redirect to login with return URL
      window.location.href = '/login?redirect=/add-item';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slide-down {
          animation: slideDown 0.6s ease-out forwards;
        }
        
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out forwards;
        }
        
        .animate-slide-up {
          animation: slideUp 0.5s ease-out forwards;
        }
        
        .item-card-enter {
          animation: slideUp 0.4s ease-out forwards;
        }
        
        .transition-smooth {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-8 shadow-lg animate-slide-down">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center mb-4">
            <svg className="w-8 h-8 mr-2 animate-slide-up" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
            </svg>
            <h1 className="text-4xl font-bold tracking-tight">Lost & Found</h1>
          </div>
          <div className="flex justify-center gap-6 flex-wrap">
            <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-semibold hover:bg-white/30 transition-smooth cursor-default">
              <span className="text-lg font-bold">{lostCount}</span> Lost Items
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-semibold hover:bg-white/30 transition-smooth cursor-default">
              <span className="text-lg font-bold">{foundCount}</span> Found Items
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search Bar */}
        <div className="mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="relative group">
            <svg className="absolute left-4 top-4 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-smooth" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search items by name, category, or location..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 bg-white transition-smooth text-gray-800 placeholder-gray-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-smooth"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <button
            onClick={() => setActiveTab('lost')}
            className={`px-8 py-3 rounded-xl font-semibold transition-smooth ${
              activeTab === 'lost'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Lost Items ({lostCount})
          </button>
          <button
            onClick={() => setActiveTab('found')}
            className={`px-8 py-3 rounded-xl font-semibold transition-smooth ${
              activeTab === 'found'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Found Items ({foundCount})
          </button>
        </div>

        {/* Items Grid */}
        <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {activeTab === 'lost' ? 'Lost Items' : 'Found Items'}
          </h2>
          <p className="text-gray-600 mb-8 text-lg">
            {activeTab === 'lost'
              ? 'Browse items that have been reported as lost. If you find something, contact the provided email.'
              : 'Browse items that have been found. If you recognize something as yours, contact the provided email.'}
          </p>

          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block">
                <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                <p className="text-gray-600 font-medium">Loading items...</p>
              </div>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-gray-600 text-lg mb-6">No items found. {!isAuthenticated && 'Sign up to report items!'}</p>
              {!isAuthenticated && (
                <Link to="/signup" className="inline-block bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-xl font-medium hover:shadow-lg transition-smooth transform hover:scale-105 active:scale-95">
                  Sign Up
                </Link>
              )}
            </div>
          ) : (
            <>
              {!isAuthenticated && (
                <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6 shadow-sm animate-slide-up text-center">
                  <p className="text-gray-700 mb-4 font-medium text-lg">Want to report a lost or found item?</p>
                  <Link
                    to="/login"
                    className="inline-block bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-smooth transform hover:scale-105 active:scale-95"
                  >
                    Login to Add Item
                  </Link>
                </div>
              )}
              <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${isSearching ? 'opacity-60' : 'opacity-100'} transition-opacity duration-300`}>
              {filteredItems.map((item, idx) => (
                <div 
                  key={item._id} 
                  className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-2xl transition-smooth transform hover:-translate-y-2 active:scale-95 item-card-enter"
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  {/* Image */}
                  <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden relative group">
                    {item.image ? (
                      <img
                        src={`http://localhost:5000${item.image}`}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-smooth duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full shadow-md ${
                        item.type === 'lost'
                          ? 'bg-red-500 text-white'
                          : 'bg-green-500 text-white'
                      }`}>
                        {item.type === 'lost' ? 'Lost' : 'Found'}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                      {item.name}
                    </h3>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>

                    {item.category && (
                      <div className="mb-4">
                        <span className="inline-block bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full font-medium">
                          {item.category}
                        </span>
                      </div>
                    )}

                    <div className="space-y-2">
                      {item.date && (
                        <div className="flex items-center text-gray-500 text-sm">
                          <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {new Date(item.date).toLocaleDateString()}
                        </div>
                      )}

                      {item.location && (
                        <div className="flex items-center text-gray-500 text-sm">
                          <svg className="w-4 h-4 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {item.location}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;