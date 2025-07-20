import { useEffect, useState } from 'react';

function App() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('http://localhost:5000/api')
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch((err) => console.error('API error:', err));
  }, []);

  return (
    <div className="text-center p-10">
      <h1 className="text-3xl font-bold text-blue-600">React + Express</h1>
      <p className="mt-5 text-gray-700">Message from backend: {message}</p>
    </div>
  );
}

export default App;

