import React from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';

const ConnectionErrorBanner = ({ message, onRetry }) => {
  return (
    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded shadow-md">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <FaExclamationTriangle className="h-5 w-5 text-red-500" />
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium">
            {message || 'Connection error. Please check your connection or try again later.'}
          </p>
        </div>
        {onRetry && (
          <div className="ml-auto">
            <button
              onClick={onRetry}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm font-medium transition duration-200"
            >
              Retry
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConnectionErrorBanner;