import React from 'react';

const Button = ({ children, onClick, className, style, disabled = false, type = 'button', buttonType = 'primary' }) => {
  let buttonClass = ""

  if (buttonType === 'secondary') {
    buttonClass = "bg-gray-800 border border-gray-300 text-gray-300";
  } else {
    buttonClass = "bg-green-600 text-white";
  }

  if (disabled) {
    buttonClass += " opacity-50 cursor-not-allowed"
  }

  return (
    <button
      type={type}
      onClick={onClick}
      style={{
        ...style,
        userSelect: 'none',
      }}
      className={`text-xl font-bold py-2 px-4 rounded-lg shadow-lg ${buttonClass} ${className}`}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;
