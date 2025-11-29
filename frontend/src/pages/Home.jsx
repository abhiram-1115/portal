import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-extrabold text-gray-900 mb-4">
            Welcome to Lost & Found Portal
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            A platform to help reunite lost items with their owners. Browse lost and found items, 
            or report your own.
          </p>

          <div className="flex justify-center gap-4 mb-12">
            <Link
              to="/lost-items"
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg text-lg font-semibold shadow-lg transition-colors"
            >
              Lost Items
            </Link>
            <Link
              to="/found-items"
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg text-lg font-semibold shadow-lg transition-colors"
            >
              Found Items
            </Link>
          </div>

          {!isAuthenticated ? (
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Get Started
              </h2>
              <p className="text-gray-600 mb-6">
                Sign up or log in to report lost or found items
              </p>
              <div className="flex justify-center gap-4">
                <Link
                  to="/login"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-md font-medium"
                >
                  Sign Up
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <Link
                to="/add-item"
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg text-lg font-semibold shadow-lg transition-colors inline-flex items-center"
              >
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Report Lost or Found Item
              </Link>
            </div>
          )}
        </div>

        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Search Items</h3>
            <p className="text-gray-600">
              Browse through lost and found items to find what you're looking for.
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Report Items</h3>
            <p className="text-gray-600">
              Report lost or found items to help others find their belongings.
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-4xl mb-4">🤝</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Reunite</h3>
            <p className="text-gray-600">
              Connect with item owners and help reunite lost items with their owners.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;