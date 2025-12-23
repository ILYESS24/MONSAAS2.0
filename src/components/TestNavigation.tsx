import React from 'react';
import { TOOL_URLS } from '@/types/plans';

export default function TestNavigation() {
  const handleTestNavigate = (toolId: string) => {
    console.log('🧪 TESTING NAVIGATION for:', toolId);
    const toolUrl = TOOL_URLS[toolId];

    if (toolUrl) {
      console.log('✅ FOUND URL:', toolUrl);
      console.log('🔄 REDIRECTING...');
      alert(`TEST: Redirecting to ${toolUrl}\n\nClick OK to continue...`);
      window.location.href = toolUrl;
    } else {
      console.error('❌ NO URL FOUND for:', toolId);
      alert(`ERROR: No URL found for ${toolId}`);
    }
  };

  return (
    <div style={{ padding: '20px', background: '#f0f0f0', minHeight: '100vh' }}>
      <h1>🧪 TEST NAVIGATION COMPONENT</h1>
      <p>This component tests the navigation logic directly.</p>

      <div style={{ margin: '20px 0' }}>
        <h2>Available Tools:</h2>
        {Object.entries(TOOL_URLS).map(([toolId, url]) => (
          <div key={toolId} style={{ margin: '10px 0', padding: '10px', background: 'white', borderRadius: '5px' }}>
            <strong>{toolId}:</strong> {url}
            <button
              onClick={() => handleTestNavigate(toolId)}
              style={{
                marginLeft: '10px',
                padding: '5px 10px',
                background: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                cursor: 'pointer'
              }}
            >
              Test Navigate
            </button>
          </div>
        ))}
      </div>

      <div style={{ margin: '20px 0', padding: '15px', background: 'yellow', border: '2px solid orange' }}>
        <h3>🔍 Debug Info:</h3>
        <p>TOOL_URLS loaded: {Object.keys(TOOL_URLS).length} tools</p>
        <p>Current location: {window.location.href}</p>
      </div>
    </div>
  );
}


