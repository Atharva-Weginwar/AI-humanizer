import React, { useState, useEffect } from 'react';
import { humanizeText, checkUserCredits } from '../../services/api';
import { useUser } from '../../contexts/UserContext';
import { saveDocument } from '../../services/supabase';
import { toast } from 'react-hot-toast';
import HumanizationSettings from './HumanizationSettings';
import LoadingIndicator from '../ui/LoadingIndicator';
import ErrorDisplay from '../ui/ErrorDisplay';
import { Copy, Download, Trash2, FileText } from 'lucide-react';

type HumanizerToolProps = {
  initialText?: string;
  documentId?: string;
  onSave?: (documentId: string) => void;
  isEditor?: boolean;
};

const HumanizerTool: React.FC<HumanizerToolProps> = ({ 
  initialText = '', 
  documentId,
  onSave,
  isEditor = false
}) => {
  const { user, refreshCredits } = useUser();
  const [inputText, setInputText] = useState(initialText);
  const [outputText, setOutputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiCredits, setApiCredits] = useState<number | null>(null);
  const [settings, setSettings] = useState({
    readability: 'High School',
    purpose: 'General Writing',
    strength: 'Balanced',
    model: 'v11'
  });
  const [documentTitle, setDocumentTitle] = useState('Untitled Document');
  const [udDocumentId, setUdDocumentId] = useState<string | null>(null);

  useEffect(() => {
    // Fetch API credits on component mount
    const fetchCredits = async () => {
      try {
        const creditData = await checkUserCredits();
        setApiCredits(creditData.credits);
      } catch (err) {
        console.error('Failed to fetch credits:', err);
      }
    };
    
    fetchCredits();
  }, []);

  useEffect(() => {
    if (initialText) {
      setInputText(initialText);
    }
  }, [initialText]);

  const handleHumanize = async () => {
    if (inputText.length < 50) {
      setError('Text must be at least 50 characters long');
      return;
    }
    
    if (inputText.length > 15000) {
      setError('Text cannot exceed 15,000 characters');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await humanizeText(inputText, settings);
      setOutputText(result.output);
      setUdDocumentId(result.id);
      
      // Update credits after humanization
      const updatedCredits = await checkUserCredits();
      setApiCredits(updatedCredits.credits);
      
      // Save to history in Supabase if user is logged in
      if (user) {
        if (documentId && onSave) {
          // Update existing document
          // This would be handled in the DocumentEditorPage
        } else {
          // Create new document
          await saveDocument(
            user.id,
            documentTitle,
            inputText,
            result.output,
            settings,
            result.id
          );
          
          toast.success('Document saved successfully');
          await refreshCredits();
        }
      }
      
    } catch (err: any) {
      setError(err.message || 'Failed to humanize text');
      toast.error(err.message || 'Failed to humanize text');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyOutput = () => {
    if (outputText) {
      navigator.clipboard.writeText(outputText);
      toast.success('Copied to clipboard');
    }
  };

  const handleDownloadOutput = () => {
    if (outputText) {
      const element = document.createElement('a');
      const file = new Blob([outputText], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `${documentTitle.replace(/\s+/g, '_')}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  };

  const handleClearInput = () => {
    setInputText('');
    setOutputText('');
    setError(null);
  };

  const handleSampleText = () => {
    setInputText(`The utilization of artificial intelligence in contemporary society has witnessed a substantial proliferation across diverse sectors. This technological advancement has facilitated enhanced efficiency and productivity in numerous domains. Organizations are increasingly implementing AI-driven solutions to optimize their operational processes and decision-making frameworks. The integration of machine learning algorithms enables systems to analyze extensive datasets and extract valuable insights that would be challenging for human analysts to discern within comparable timeframes. Furthermore, the automation capabilities provided by AI technologies have revolutionized routine task execution, allowing human resources to focus on more complex and creative endeavors that necessitate uniquely human cognitive abilities.`);
  };

  return (
    <div className="humanizer-tool w-full max-w-7xl mx-auto">
      {isEditor && (
        <div className="mb-4">
          <label htmlFor="document-title" className="block text-sm font-medium text-gray-700 mb-1">
            Document Title
          </label>
          <input
            type="text"
            id="document-title"
            value={documentTitle}
            onChange={(e) => setDocumentTitle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter document title"
          />
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-4">
        {/* Input Panel */}
        <div className="flex-1 border border-gray-200 rounded-lg shadow-sm bg-white">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-medium">Original Text</h3>
            <div className="flex space-x-2">
              <button 
                onClick={handleSampleText}
                className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
              >
                <FileText size={16} className="mr-1" />
                Sample Text
              </button>
              <button 
                onClick={handleClearInput}
                className="text-gray-600 hover:text-gray-800"
                title="Clear text"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
          <div className="p-4">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full h-64 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Paste your AI-generated text here (minimum 50 characters, maximum 15,000 characters)"
              disabled={isLoading}
            ></textarea>
            <div className="mt-2 text-sm text-gray-500 flex justify-between">
              <span className={inputText.length < 50 || inputText.length > 15000 ? 'text-red-500' : ''}>
                {inputText.length} / 15,000 characters
              </span>
              {apiCredits !== null && (
                <span>
                  API Credits: {apiCredits}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Center Controls */}
        <div className="flex flex-col justify-center items-center py-4 lg:py-0">
          <HumanizationSettings settings={settings} onSettingsChange={setSettings} />
          
          <button
            onClick={handleHumanize}
            disabled={isLoading || inputText.length < 50 || inputText.length > 15000}
            className="mt-4 px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Processing...' : 'Humanize'}
          </button>
          
          {isLoading && (
            <div className="mt-4">
              <LoadingIndicator />
            </div>
          )}
        </div>

        {/* Output Panel */}
        <div className="flex-1 border border-gray-200 rounded-lg shadow-sm bg-white">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-medium">Humanized Text</h3>
            <div className="flex space-x-2">
              <button 
                onClick={handleCopyOutput}
                className="text-gray-600 hover:text-gray-800"
                title="Copy to clipboard"
                disabled={!outputText}
              >
                <Copy size={18} />
              </button>
              <button 
                onClick={handleDownloadOutput}
                className="text-gray-600 hover:text-gray-800"
                title="Download as text file"
                disabled={!outputText}
              >
                <Download size={18} />
              </button>
            </div>
          </div>
          <div className="p-4">
            <div className="w-full h-64 p-3 border border-gray-300 rounded-md overflow-auto bg-gray-50">
              {outputText ? (
                <p className="whitespace-pre-wrap">{outputText}</p>
              ) : (
                <p className="text-gray-400 italic">Your humanized text will appear here</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {error && <ErrorDisplay error={error} />}
    </div>
  );
};

export default HumanizerTool;