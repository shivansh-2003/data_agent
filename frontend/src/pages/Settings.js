import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Button from '../components/common/Button';
import Card from '../components/common/Card';

const Settings = () => {
  const { user, logout } = useAuth();
  const { themePreference, setTheme } = useTheme();
  const [selectedModel, setSelectedModel] = useState(user?.model || 'gpt-4');
  const [agentType, setAgentType] = useState(user?.agentType || 'LangChain Agent');
  const [saved, setSaved] = useState(false);

  const handleThemeChange = (theme) => {
    setTheme(theme);
  };

  const handleSaveSettings = () => {
    // In a real app, this would save to backend too
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <h2 className="text-xl font-semibold mb-4">Appearance</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Theme</label>
            <div className="flex gap-2">
              <button
                onClick={() => handleThemeChange('light')}
                className={`px-4 py-2 rounded ${
                  themePreference === 'light'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                Light
              </button>
              <button
                onClick={() => handleThemeChange('dark')}
                className={`px-4 py-2 rounded ${
                  themePreference === 'dark'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                Dark
              </button>
              <button
                onClick={() => handleThemeChange('system')}
                className={`px-4 py-2 rounded ${
                  themePreference === 'system'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                System
              </button>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold mb-4">AI Settings</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Model</label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="gpt-4">GPT-4</option>
              <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
              <option value="gpt-4-vision">GPT-4 Vision</option>
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Agent Type</label>
            <select
              value={agentType}
              onChange={(e) => setAgentType(e.target.value)}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="LangChain Agent">LangChain Agent</option>
              <option value="Custom Agent">Custom Agent</option>
            </select>
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold mb-4">Account</h2>
          {user ? (
            <div>
              <p className="mb-2">
                <span className="font-medium">Session ID:</span> {user.sessionId}
              </p>
              <p className="mb-2">
                <span className="font-medium">Current Model:</span> {user.model}
              </p>
              <p className="mb-4">
                <span className="font-medium">Agent Type:</span> {user.agentType}
              </p>
              <Button onClick={logout} variant="danger">
                Log Out
              </Button>
            </div>
          ) : (
            <p>Not logged in</p>
          )}
        </Card>

        <div className="md:col-span-2 flex justify-end gap-4 mt-4">
          {saved && (
            <div className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100 px-4 py-2 rounded">
              Settings saved successfully!
            </div>
          )}
          <Button onClick={handleSaveSettings} variant="primary">
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings; 