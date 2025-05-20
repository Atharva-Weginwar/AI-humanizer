import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { getDocuments, deleteDocument } from '../services/supabase';
import { FileText, Plus, Trash2, Edit, Search, AlertTriangle } from 'lucide-react';
import LoadingIndicator from '../components/ui/LoadingIndicator';
import { toast } from 'react-hot-toast';

type Document = {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  character_count: number;
};

const DocumentsPage: React.FC = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    const fetchDocuments = async () => {
      setLoading(true);
      try {
        if (user) {
          const docs = await getDocuments(user.id);
          setDocuments(docs);
        }
      } catch (error) {
        console.error('Error fetching documents:', error);
        toast.error('Failed to load documents');
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [user]);

  const handleCreateNew = () => {
    navigate('/documents/new');
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      setIsDeleting(id);
      try {
        await deleteDocument(id);
        setDocuments(documents.filter(doc => doc.id !== id));
        toast.success('Document deleted successfully');
      } catch (error) {
        console.error('Error deleting document:', error);
        toast.error('Failed to delete document');
      } finally {
        setIsDeleting(null);
      }
    }
  };

  const filteredDocuments = documents.filter(doc => 
    doc.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingIndicator size="large" message="Loading documents..." />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              My Documents
            </h2>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <button
              onClick={handleCreateNew}
              className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="-ml-1 mr-2 h-5 w-5" />
              New Document
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-6">
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-3"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Documents List */}
        {filteredDocuments.length > 0 ? (
          <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {filteredDocuments.map((doc) => (
                <li key={doc.id}>
                  <div className="px-4 py-4 sm:px-6 flex items-center justify-between hover:bg-gray-50">
                    <Link to={`/documents/${doc.id}`} className="flex-1">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <FileText className="h-6 w-6 text-gray-400" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-blue-600 truncate">{doc.title}</p>
                          <div className="flex mt-1">
                            <p className="text-xs text-gray-500 mr-4">
                              Created: {new Date(doc.created_at).toLocaleDateString()}
                            </p>
                            {doc.updated_at && (
                              <p className="text-xs text-gray-500">
                                Updated: {new Date(doc.updated_at).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {doc.character_count.toLocaleString()} characters
                          </p>
                        </div>
                      </div>
                    </Link>
                    <div className="ml-4 flex-shrink-0 flex">
                      <Link
                        to={`/documents/${doc.id}`}
                        className="mr-2 inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(doc.id)}
                        disabled={isDeleting === doc.id}
                        className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-red-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        {isDeleting === doc.id ? (
                          <div className="h-4 w-4 mr-1 animate-spin rounded-full border-t-2 border-b-2 border-red-500"></div>
                        ) : (
                          <Trash2 className="h-4 w-4 mr-1" />
                        )}
                        Delete
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-md p-8 text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-yellow-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No documents found</h3>
            {searchTerm ? (
              <p className="mt-1 text-sm text-gray-500">
                No documents match your search criteria. Try a different search term or create a new document.
              </p>
            ) : (
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating your first document.
              </p>
            )}
            <div className="mt-6">
              <button
                onClick={handleCreateNew}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="-ml-1 mr-2 h-5 w-5" />
                New Document
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentsPage;