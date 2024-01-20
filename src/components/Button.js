import React from 'react';

const Button = ({ children, onClick, className, style, disabled = false, type = 'button', buttonType = 'primary' }) => {
  const buttonTypeClass = buttonType === 'primary' ? 'bg-green-600 text-white' : 'bg-gray-200 border border-gray-300 text-gray-300'
  return (
    <button
      type={type}
      onClick={onClick}
      style={{
        ...style, 
        userSelect: 'none',
      }}
      className={`text-xl font-bold py-2 px-4 rounded-lg shadow-lg ${buttonTypeClass} ${className}`}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;
