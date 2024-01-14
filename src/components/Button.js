import React from 'react';

const Button = ({ children, onClick, className, style, disabled = false, type = 'button', buttonType = 'primary' }) => {
  const buttonTypeClass = buttonType === 'primary' ? 'bg-blue-500 hover:bg-blue-700 text-white' : 'bg-gray-100 hover:bg-gray-200 border border-gray-800 text-gray-800'
  return (
    <button
      type={type}
      onClick={onClick}
      style={{...style, userSelect: 'none'}}
      className={`text-xl font-bold py-2 px-4 rounded-lg shadow-lg ${buttonTypeClass} ${className}`}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;
