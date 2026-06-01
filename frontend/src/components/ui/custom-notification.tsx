"use client"

import React, { useState, useEffect } from 'react';
import { CheckCircle, X, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CustomNotificationProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  isVisible: boolean;
  onClose: () => void;
  autoClose?: boolean;
  duration?: number;
}

const CustomNotification: React.FC<CustomNotificationProps> = ({
  message,
  type = 'success',
  isVisible,
  onClose,
  autoClose = true,
  duration = 4000
}) => {
  useEffect(() => {
    if (isVisible && autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, autoClose, duration, onClose]);

  if (!isVisible) return null;

  const getIcon = () => {
    const iconColor = "text-white"; // Always white for good contrast on colored backgrounds
    const iconSize = "w-5 h-5 sm:w-6 sm:h-6"; // Smaller on mobile
    switch (type) {
      case 'success':
        return <CheckCircle className={`${iconSize} ${iconColor}`} />;
      case 'error':
        return <X className={`${iconSize} ${iconColor}`} />;
      case 'info':
        return <Mail className={`${iconSize} ${iconColor}`} />;
      default:
        return <CheckCircle className={`${iconSize} ${iconColor}`} />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-[#D8A04A] border border-[#D8A04A]/20';
      case 'error':
        return 'bg-destructive border border-destructive/20'; // App's destructive color
      case 'info':
        return 'bg-[#DF9C49] border border-[#DF9C49]/20'; // Primary gold from app palette
      default:
        return 'bg-[#DF9C49] border border-[#DF9C49]/20';
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'success':
        return 'text-white'; // White text on teal
      case 'error':
        return 'text-white'; // White text on red
      case 'info':
        return 'text-white'; // White text on gold
      default:
        return 'text-white';
    }
  };

  return (
    <div className="fixed top-4 sm:top-4 right-4 sm:right-4 left-4 sm:left-auto z-[9999] max-w-sm sm:max-w-md mx-auto sm:mx-0">
      <div
        className={cn(
          "flex items-center space-x-2 sm:space-x-3 p-3 sm:p-4 rounded-xl shadow-lg",
          "transform transition-all duration-300 ease-out",
          getBackgroundColor(),
          isVisible 
            ? "translate-y-0 sm:translate-x-0 opacity-100 scale-100" 
            : "-translate-y-full sm:translate-y-0 sm:translate-x-full opacity-0 scale-95"
        )}
      >
        {/* Icon */}
        <div className="flex-shrink-0">
          {getIcon()}
        </div>

        {/* Message */}
        <div className="flex-1 min-w-0">
          <p className={cn("font-medium text-xs sm:text-sm leading-relaxed break-words", getTextColor())}>
            {message}
          </p>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="flex-shrink-0 p-1.5 sm:p-1 rounded-full hover:bg-white/20 transition-colors duration-200 touch-manipulation"
        >
          <X className="w-4 h-4 sm:w-4 sm:h-4 text-white" />
        </button>
      </div>
    </div>
  );
};

// Hook for managing notification state
export const useNotification = () => {
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
    isVisible: boolean;
  }>({
    message: '',
    type: 'success',
    isVisible: false
  });

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotification({
      message,
      type,
      isVisible: true
    });
  };

  const hideNotification = () => {
    setNotification(prev => ({
      ...prev,
      isVisible: false
    }));
  };

  const NotificationComponent = () => (
    <CustomNotification
      message={notification.message}
      type={notification.type}
      isVisible={notification.isVisible}
      onClose={hideNotification}
    />
  );

  return {
    showNotification,
    hideNotification,
    NotificationComponent
  };
};

export default CustomNotification;