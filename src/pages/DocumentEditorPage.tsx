import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { getDocument, updateDocument, saveDocument } from '../services/supabase';
import { humanizeText, rehumanizeDocument } from '../services/api';
import HumanizerTool from '../components/humanizer/HumanizerTool';
import LoadingIndicator from '../components/ui/LoadingIndicator';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Save } from 'lucide-react';

const DocumentEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useUser();
  const [document, setDocument] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState('');
  const [originalText, setOriginalText] = useState('');
  const [humanizedText, setHumanizedText] = useState('');
  const [settings, setSettings] = useState({
    readability: 'High School',
    purpose: 'General Writing',
    strength: 'Balanced',
    model: 'v11'
  });

  useEffect(() => {
    const fetchDocument = async () => {
      setLoading(true);
      try {
        if (id && id !== 'new' && user) {
          const doc = await getDocument(id);
          setDocument(doc);
          setTitle(doc.title);
          setOriginalText(doc.original_text);
          setHumanizedText(doc.humanized_text);
          if (doc.humanization_settings) {
            setSettings(doc.humanization_settings);
          }
        }
      } catch (error) {
        console.error('Error fetching document:', error);
        toast.error('Failed to load document');
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [id, user]);

  const handleSave = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      if (id && id !== 'new') {
        // Update existing document
        await updateDocument(id, {
          title,
          original_text: originalText,
          humanized_text: humanizedText,
          updated_at: new Date().toISOString(),
          character_count: originalText.length,
          humanization_settings: settings
        });
        toast.success('Document updated successfully');
      } else {
        // Create new document
        const result = await saveDocument(
          user.id,
          title || 'Untitled Document',
          originalText,
          humanizedText,
          settings,
          ''
        );
        toast.success('Document created successfully');
        navigate(`/documents/${result[0].id}`);
      }
    } catch (error) {
      console.error('Error saving document:', error);
      toast.error('Failed to save document');
    } finally {
      setSaving(false);
    }
  };

  const handleHumanize = async () => {
    if (originalText.length < 50) {
      toast.error('Text must be at least 50 characters long');
      return;
    }
    
    if (originalText.length > 15000) {
      toast.error('Text cannot exceed 15,000 characters');
      return;
    }
    
    setSaving(true);
    
    try {
      const result = await humanizeText(originalText, settings);
      setHumanizedText(result.output);
      
      // Save the document with the humanized text
      if (id && id !== 'new') {
        await updateDocument(id, {
          humanized_text: result.output,
          updated_at: new Date().toISOString(),
          ud_document_id: result.id
        });
      }
      
      toast.success('Text humanized successfully');
    } catch (err: any) {
      console.error('Humanization error:', err);
      toast.error(err.message || 'Failed to humanize text');
    } finally {
      setSaving(false);
    }
  };

  const handleRehumanize = async () => {
    if (!document?.ud_document_id) {
      toast.error('Cannot rehumanize. No original document ID found.');
      return;
    }
    
    setSaving(true);
    
    try {
      const result = await rehumanizeDocument(document.ud_document_id);
      
      // Poll for the new document
      const maxAttempts = 12;
      let attempts = 0;
      let output;
      
      while (attempts < maxAttempts) {
        attempts++;
        
        // Wait 5 seconds between polls
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        try {
          const response = await fetch('https://humanize.undetectable.ai/document', {
            method: 'POST',
            headers: {
              'apikey': import.meta.env.VITE_UNDETECTABLE_API_KEY,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              id: result.id
            })
          });
          
          if (!response.ok) {
            throw new Error("Failed to retrieve document status");
          }
          
          const data = await response.json();
          
          if (data.output) {
            output = data.output;
            break;
          }
        } catch (err) {
          console.error('Error polling document:', err);
        }
      }
      
      if (!output) {
        throw new Error('Rehumanization timed out');
      }
      
      setHumanizedText(output);
      
      // Update the document with the new humanized text
      await updateDocument(id!, {
        humanized_text: output,
        updated_at: new Date().toISOString(),
        ud_document_id: result.id
      });
      
      toast.success('Text rehumanized successfully');
    } catch (err: any) {
      console.error('Rehumanization error:', err);
      toast.error(err.message || 'Failed to rehumanize text');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingIndicator size="large" message="Loading document..." />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/documents')}
              className="mr-4 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <ArrowLeft className="-ml-0.5 mr-2 h-4 w-4" />
              Back
            </button>
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              {id === 'new' ? 'New Document' : 'Edit Document'}
            </h2>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <button
              onClick={handleSave}
              disabled={saving || !originalText}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <div className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="-ml-1 mr-2 h-5 w-5" />
                  Save Document
                </>
              )}
            </button>
          </div>
        </div>

        <div className="mt-6">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Document Title
          </label>
          <input
            type="text"
            name="title"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter document title"
            className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
          />
        </div>

        <div className="mt-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Input Panel */}
            <div className="flex-1 border border-gray-200 rounded-lg shadow-sm bg-white">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-medium">Original Text</h3>
              </div>
              <div className="p-4">
                <textarea
                  value={originalText}
                  onChange={(e) => setOriginalText(e.target.value)}
                  className="w-full h-64 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Enter or paste your AI-generated text here (minimum 50 characters, maximum 15,000 characters)"
                  disabled={saving}
                ></textarea>
                <div className="mt-2 text-sm text-gray-500">
                  <span className={originalText.length < 50 || originalText.length > 15000 ? 'text-red-500' : ''}>
                    {originalText.length} / 15,000 characters
                  </span>
                </div>
              </div>
            </div>

            {/* Output Panel */}
            <div className="flex-1 border border-gray-200 rounded-lg shadow-sm bg-white">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-medium">Humanized Text</h3>
              </div>
              <div className="p-4">
                <textarea
                  value={humanizedText}
                  onChange={(e) => setHumanizedText(e.target.value)}
                  className="w-full h-64 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Humanized text will appear here"
                  disabled={saving}
                ></textarea>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-4 justify-center">
            <button
              onClick={handleHumanize}
              disabled={saving || originalText.length < 50 || originalText.length > 15000}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Processing...' : 'Humanize Text'}
            </button>
            
            {document?.ud_document_id && (
              <button
                onClick={handleRehumanize}
                disabled={saving}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Processing...' : 'Rehumanize Text'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentEditorPage;