import React from 'react';
import { ChevronDown } from 'lucide-react';

type HumanizationSettingsProps = {
  settings: {
    readability: string;
    purpose: string;
    strength: string;
    model: string;
  };
  onSettingsChange: (settings: any) => void;
};

const HumanizationSettings: React.FC<HumanizationSettingsProps> = ({ 
  settings, 
  onSettingsChange 
}) => {
  const readabilityOptions = [
    "High School", 
    "University", 
    "Doctorate", 
    "Journalist", 
    "Marketing"
  ];
  
  const purposeOptions = [
    "General Writing", 
    "Essay", 
    "Article", 
    "Marketing Material", 
    "Story", 
    "Cover Letter", 
    "Report", 
    "Business Material", 
    "Legal Material"
  ];
  
  const strengthOptions = [
    "Quality", 
    "Balanced", 
    "More Human"
  ];
  
  const handleChange = (field: string, value: string) => {
    onSettingsChange({
      ...settings,
      [field]: value
    });
  };

  return (
    <div className="w-full max-w-xs space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Readability
        </label>
        <div className="relative">
          <select
            value={settings.readability}
            onChange={(e) => handleChange('readability', e.target.value)}
            className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md appearance-none"
          >
            {readabilityOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <ChevronDown size={16} />
          </div>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Purpose
        </label>
        <div className="relative">
          <select
            value={settings.purpose}
            onChange={(e) => handleChange('purpose', e.target.value)}
            className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md appearance-none"
          >
            {purposeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <ChevronDown size={16} />
          </div>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Strength
        </label>
        <div className="relative">
          <select
            value={settings.strength}
            onChange={(e) => handleChange('strength', e.target.value)}
            className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md appearance-none"
          >
            {strengthOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <ChevronDown size={16} />
          </div>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Model
        </label>
        <div className="flex items-center space-x-4">
          <label className="inline-flex items-center">
            <input
              type="radio"
              value="v2"
              checked={settings.model === 'v2'}
              onChange={() => handleChange('model', 'v2')}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <span className="ml-2 text-sm text-gray-700">v2</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              value="v11"
              checked={settings.model === 'v11'}
              onChange={() => handleChange('model', 'v11')}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <span className="ml-2 text-sm text-gray-700">v11</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default HumanizationSettings;