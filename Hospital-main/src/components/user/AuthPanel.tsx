import React, { useState } from 'react';
import { api } from '../../api';

const AuthPanel: React.FC = () => {
  const [mode, setMode] = useState<'login' | 'register'>('register');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      if (mode === 'register') {
        const res = await api.register({ name, email, password, role: 'patient' });
        setMessage(res.message || 'Registered');
      } else {
        const res = await api.login({ email, password });
        setMessage(res.message || 'Logged in');
        // Persist token for later authenticated requests
        localStorage.setItem('lifeline_token', res.token);
        localStorage.setItem('lifeline_user', JSON.stringify(res.user));
      }
    } catch (err: any) {
      setError(err?.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-800">Account</h3>
        <div className="space-x-2">
          <button
            onClick={() => setMode('register')}
            className={`px-3 py-1 rounded-md text-sm ${mode === 'register' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            Sign up
          </button>
          <button
            onClick={() => setMode('login')}
            className={`px-3 py-1 rounded-md text-sm ${mode === 'login' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            Log in
          </button>
        </div>
      </div>

      <form onSubmit={onSubmit} className="grid grid-cols-1 gap-3">
        {mode === 'register' && (
          <input
            type="text"
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        )}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white rounded-md py-2 font-medium disabled:opacity-50"
        >
          {loading ? 'Please wait…' : mode === 'register' ? 'Create account' : 'Sign in'}
        </button>
      </form>

      {message && <p className="text-green-700 text-sm mt-3">{message}</p>}
      {error && <p className="text-red-600 text-sm mt-3">{error}</p>}
      <p className="text-xs text-gray-500 mt-2">Backend: {import.meta.env.VITE_API_URL || 'http://localhost:5000'}</p>
    </div>
  );
};

export default AuthPanel;


