import React from 'react';

const EmailPreview = ({ emailConfig }) => {
  return (
    <div className="flex flex-col items-center justify-start w-full h-full">
      <div className="w-full flex justify-center items-center mb-6">
        {emailConfig.imageUrl && (
          <img 
            src={emailConfig.imageUrl} 
            alt="Email logo" 
            className="max-w-[200px] w-auto h-auto mx-auto"
            style={{ display: 'block' }}
          />
        )}
      </div>

      <div className="w-full text-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          {emailConfig.title || 'Your Email Title'}
        </h2>
      </div>

      <div className="w-full max-w-lg mx-auto space-y-4">
        <div className="w-full bg-gray-50 p-4 rounded text-center">
          {emailConfig.sections.find(s => s.type === 'header')?.content || 'Header Content'}
        </div>

        <div className="w-full bg-white border p-4 rounded text-center">
          {emailConfig.sections.find(s => s.type === 'body')?.content || 'Body Content'}
        </div>

        <div className="w-full bg-gray-50 p-4 rounded text-center text-sm">
          {emailConfig.sections.find(s => s.type === 'footer')?.content || 'Footer Content'}
        </div>
      </div>
    </div>
  );
};

export default EmailPreview;