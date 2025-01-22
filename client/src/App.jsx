import React, { useState, useEffect } from 'react';
import { getEmailLayout, uploadImage, saveEmailConfig, renderTemplate } from './services/api';
import EmailPreview from './components/EmailPreview';

function App() {
  const [emailConfig, setEmailConfig] = useState({
    title: '',
    imageUrl: '',
    sections: [
      { id: '1', type: 'header', content: '' },
      { id: '2', type: 'body', content: '' },
      { id: '3', type: 'footer', content: '' }
    ]
  });
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadedImage, setUploadedImage] = useState(null);

  useEffect(() => {
    const fetchLayout = async () => {
      try {
        const { layout } = await getEmailLayout();
        setPreview(layout);
      } catch (err) {
        setError('Error loading email layout');
        console.error('Error:', err);
      }
    };
    fetchLayout();
  }, []);

  const handleTitleChange = (e) => {
    setEmailConfig(prev => ({
      ...prev,
      title: e.target.value
    }));
  };

  const handleSectionChange = (type, content) => {
    setEmailConfig(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.type === type ? { ...section, content } : section
      )
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      setLoading(true);
      const response = await uploadImage(formData);
      setEmailConfig(prev => ({
        ...prev,
        imageUrl: response.imageUrl
      }));
      setUploadedImage(URL.createObjectURL(file));
      setError('');
    } catch (err) {
      setError('Error uploading image');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMoveSection = (fromIndex, toIndex) => {
    setEmailConfig(prev => {
      const newSections = [...prev.sections];
      const [movedSection] = newSections.splice(fromIndex, 1);
      newSections.splice(toIndex, 0, movedSection);
      return { ...prev, sections: newSections };
    });
  };

  const handlePreview = async () => {
    try {
      setLoading(true);
      const response = await renderTemplate(emailConfig);
      setPreview(response.html);
      setError('');
    } catch (err) {
      setError('Error generating preview');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError('');

      if (!emailConfig.title.trim()) {
        throw new Error('Title is required');
      }

      const configToSave = {
        title: emailConfig.title.trim(),
        imageUrl: emailConfig.imageUrl || '',
        sections: emailConfig.sections.map(section => ({
          id: section.id,
          type: section.type,
          content: section.content.trim()
        }))
      };

      const result = await saveEmailConfig(configToSave);
      
      if (result && result.success) {
        alert('Template saved successfully!');
      } else {
        throw new Error('Failed to save template');
      }
    } catch (err) {
      setError(typeof err === 'string' ? err : err.message || 'Failed to save template');
      console.error('Save error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Email Builder</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-6">Email Configuration</h2>
            
            <div className="space-y-6">
              <div className="border-b pb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Logo Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
                {uploadedImage && (
                  <div className="mt-4 flex justify-center">
                    <img 
                      src={uploadedImage} 
                      alt="Logo preview" 
                      className="max-h-40 rounded-md"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={emailConfig.title}
                  onChange={handleTitleChange}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter email title..."
                />
              </div>

              {emailConfig.sections.map((section, index) => (
                <div key={section.id} 
                     className="border rounded-md p-4 bg-gray-50 relative">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700 capitalize">
                      {section.type}
                    </label>
                    <div className="space-x-2">
                      <button
                        onClick={() => handleMoveSection(index, Math.max(0, index - 1))}
                        disabled={index === 0}
                        className="px-2 py-1 text-sm bg-gray-200 rounded-md hover:bg-gray-300 
                                 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => handleMoveSection(index, Math.min(emailConfig.sections.length - 1, index + 1))}
                        disabled={index === emailConfig.sections.length - 1}
                        className="px-2 py-1 text-sm bg-gray-200 rounded-md hover:bg-gray-300 
                                 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        ↓
                      </button>
                    </div>
                  </div>
                  <textarea
                    value={section.content}
                    onChange={(e) => handleSectionChange(section.type, e.target.value)}
                    className="w-full p-2 border rounded-md min-h-[100px] focus:ring-2 focus:ring-blue-500"
                    placeholder={`Enter ${section.type} content...`}
                  />
                </div>
              ))}

              {error && (
                <div className="text-red-500 text-sm bg-red-50 p-3 rounded-md">
                  {error}
                </div>
              )}

              <div className="flex space-x-4 pt-4">
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 
                           focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Template'}
                </button>
                <button
                  onClick={handlePreview}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 
                           focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                >
                  {loading ? 'Loading...' : 'Preview'}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 min-h-[600px]">
            <h2 className="text-xl font-semibold mb-6">Preview</h2>
            <div className="border rounded-md p-4 bg-gray-50 h-[calc(100vh-240px)] overflow-auto">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <span className="text-gray-500">Loading preview...</span>
                </div>
              ) : preview ? (
                <div 
                  dangerouslySetInnerHTML={{ __html: preview }} 
                  className="flex flex-col items-center justify-start w-full h-full"
                />
              ) : (
                <EmailPreview emailConfig={emailConfig} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;