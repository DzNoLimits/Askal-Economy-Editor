import React, { useState, useEffect } from 'react';

const SimpleTest = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        console.log('🔍 Component mounted, testing API...');
        
        const testAPI = async () => {
            try {
                console.log('📡 Fetching from http://localhost:3003/api/collections');
                const response = await fetch('http://localhost:3003/api/collections');
                console.log('📊 Response:', response);
                
                if (response.ok) {
                    const json = await response.json();
                    console.log('✅ Success:', json);
                    setData(json);
                } else {
                    console.error('❌ Response not OK:', response.status, response.statusText);
                    setError(`HTTP ${response.status}: ${response.statusText}`);
                }
            } catch (err) {
                console.error('❌ Fetch error:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        testAPI();
    }, []);

    if (loading) {
        return (
            <div style={{ padding: '20px', color: 'white', backgroundColor: '#2c3e50' }}>
                <h1>🔄 Loading...</h1>
                <p>Testing API connection...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: '20px', color: 'white', backgroundColor: '#e74c3c' }}>
                <h1>❌ Error</h1>
                <p>{error}</p>
                <button onClick={() => window.location.reload()}>Try Again</button>
            </div>
        );
    }

    return (
        <div style={{ padding: '20px', color: 'white', backgroundColor: '#27ae60' }}>
            <h1>✅ API Working!</h1>
            <h2>Collections ({data ? data.length : 0}):</h2>
            {data && data.map(collection => (
                <div key={collection.id} style={{ 
                    padding: '10px', 
                    margin: '10px 0', 
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '5px'
                }}>
                    <strong>{collection.icon} {collection.display_name}</strong>
                    <p>{collection.description}</p>
                    <small>{collection.category_count} categories • {collection.item_count} items</small>
                </div>
            ))}
            <button onClick={() => window.location.reload()}>Reload</button>
        </div>
    );
};

export default SimpleTest;