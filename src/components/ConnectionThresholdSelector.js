import React, { useState } from 'react';
import { updateDoc } from 'firebase/firestore'; // Ensure you import updateDoc correctly

const ConnectionThresholdSelector = ({ roundData, roundRef }) => {
  const { connectionScores } = roundData;
  const all = 0;
  const median = connectionScores[Math.floor(connectionScores.length / 2)];
  const strong = connectionScores[Math.floor(connectionScores.length * (2 / 3))];
  const strongest = connectionScores[Math.floor(connectionScores.length * (4 / 5))];

  const options = [
    { label: 'All Connections', value: all },
    { label: 'Median Connections', value: median },
    { label: 'Strong Connections', value: strong },
    { label: 'Strongest Connections', value: strongest }
  ];

  const [selectedOption, setSelectedOption] = useState(options[1].value);

  const handleChange = async (newValue) => {
    setSelectedOption(newValue);
    try {
      await updateDoc(roundRef, { connectionThreshold: newValue });
      console.log("Update successful");
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  };

  return (
    <div className="flex flex-col space-y-3 p-4">
      {options.map((option) => (
        <label key={option.value} className="flex items-center space-x-3">
          <input
            type="radio"
            name="connectionThreshold"
            value={option.value}
            checked={selectedOption === option.value}
            onChange={() => handleChange(option.value)}
            className="radio radio-primary w-8 h-8" // Larger radio buttons
          />
          <span className="text-xl">{option.label}</span> {/* Larger text */}
        </label>
      ))}
    </div>

  );
};

export default ConnectionThresholdSelector;
