import React, { useState, useEffect } from 'react';

const DebugConsole = () => {
    const [apiStatus, setApiStatus] = useState('Testing...');
    const [collections, setCollections] = useState([]);

    useEffect(() => {
        testAPI();
    }, []);

    const testAPI = async () => {
        try {
            console.log('🔍 Testing API connection...');
            
            // Testar conexão básica
            const response = await fetch('http://localhost:3003/api/collections');
            console.log('📡 Response status:', response.status);
            
            if (response.ok) {
                const data = await response.json();
                console.log('📊 Collections data:', data);
                setCollections(data);
                setApiStatus(`✅ API Working - ${data.length} collections found`);
            } else {
                console.error('❌ API Error:', response.statusText);
                setApiStatus(`❌ API Error: ${response.status} ${response.statusText}`);
            }
        } catch (error) {
            console.error('❌ Network Error:', error);
            setApiStatus(`❌ Network Error: ${error.message}`);
        }
    };

    return (
        <div style={{ 
            position: 'fixed', 
            bottom: 20, 
            right: 20, 
            background: 'rgba(0,0,0,0.8)', 
            color: 'white', 
            padding: 15, 
            borderRadius: 8,
            fontFamily: 'monospace',
            fontSize: 12,
            zIndex: 9999,
            maxWidth: 300
        }}>
            <div><strong>🔧 Debug Console</strong></div>
            <div>API Status: {apiStatus}</div>
            <div>Collections: {collections.length}</div>
            <div>URL: http://localhost:3003/api/collections</div>
            <button onClick={testAPI} style={{ marginTop: 8 }}>
                Test Again
            </button>
        </div>
    );
};

export default DebugConsole;