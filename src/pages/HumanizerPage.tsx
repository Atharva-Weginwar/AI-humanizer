import React, { useState } from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import HumanizerTool from '../components/humanizer/HumanizerTool';
import { useUser } from '../contexts/UserContext';
import { FileText } from 'lucide-react';

const HumanizerPage: React.FC = () => {
  // This page is wrapped in ProtectedRoute, so user is always defined
  const { user } = useUser();
  const [showPaste, setShowPaste] = useState(true);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <main className="flex-grow flex flex-col items-center justify-center py-8 px-2">
        <div className="w-full max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2">AI Humanizer</h1>
            <p className="text-lg text-gray-600">Paste your content below to humanize AI-generated text with TextHuman's AI Humanizer.</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col md:flex-row gap-6">
            {/* Left: Input and settings */}
            <div className="flex-1 flex flex-col border-r border-gray-100 pr-0 md:pr-6">
              <HumanizerTool isEditor={false} />
            </div>
            {/* Right: Output (handled by HumanizerTool) */}
            {/* HumanizerTool handles both input and output, so right side is empty here */}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default HumanizerPage; 