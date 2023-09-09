import React from 'react';
import './App.css'; // You may have other stylesheets here
import PostManagement from './PostManagement';

function App() {
  return (
    <div className="App">
      {/* Your app header or navigation can go here */}
      <header className="App-header">
        <h1>Welcome to My Post Management App</h1>
      </header>

      {/* Render the PostManagement component */}
      <main>
        <PostManagement />
      </main>
    </div>
  );
}

export default App;
