import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Alert, 
  Card, 
  CardContent,
  Grid,
  Divider,
  IconButton,
  InputAdornment,
  Link
} from '@mui/material';
import { motion } from 'framer-motion';
import { Visibility, VisibilityOff, Lock, Api, AccountCircle } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/common/Loader';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading, login, error } = useAuth();
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [model, setModel] = useState('gpt-4');
  const [agentType, setAgentType] = useState('LangChain Agent');
  const [localError, setLocalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!apiKey.trim()) {
      setLocalError('OpenAI API key is required');
      return;
    }
    
    setLocalError('');
    setIsSubmitting(true);
    
    try {
      await login(apiKey, model, agentType);
      navigate('/dashboard');
    } catch (err) {
      setLocalError(err.message || 'Authentication failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" gutterBottom fontWeight="bold" color="primary">
            Connect to the Data Analyst AI
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Enter your OpenAI API key to access powerful data analysis capabilities
          </Typography>
        </Box>
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Card elevation={3} sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Api color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">
                    API Connection
                  </Typography>
                </Box>
                
                <Divider sx={{ mb: 3 }} />
                
                <form onSubmit={handleSubmit}>
                  <TextField
                    label="OpenAI API Key"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    type={showApiKey ? 'text' : 'password'}
                    required
                    placeholder="sk-..."
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowApiKey(!showApiKey)}
                            edge="end"
                          >
                            {showApiKey ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  
                  <FormControl fullWidth margin="normal">
                    <InputLabel id="model-select-label">Model</InputLabel>
                    <Select
                      labelId="model-select-label"
                      value={model}
                      label="Model"
                      onChange={(e) => setModel(e.target.value)}
                    >
                      <MenuItem value="gpt-4">GPT-4</MenuItem>
                      <MenuItem value="gpt-4-turbo">GPT-4 Turbo</MenuItem>
                      <MenuItem value="gpt-3.5-turbo">GPT-3.5 Turbo</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <FormControl fullWidth margin="normal">
                    <InputLabel id="agent-type-label">Agent Type</InputLabel>
                    <Select
                      labelId="agent-type-label"
                      value={agentType}
                      label="Agent Type"
                      onChange={(e) => setAgentType(e.target.value)}
                    >
                      <MenuItem value="LangChain Agent">LangChain Agent</MenuItem>
                      <MenuItem value="LangGraph Agent">LangGraph Agent</MenuItem>
                    </Select>
                  </FormControl>
                  
                  {(error || localError) && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                      {error || localError}
                    </Alert>
                  )}
                  
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    size="large"
                    sx={{ mt: 3 }}
                    disabled={isSubmitting || isLoading}
                  >
                    {isSubmitting || isLoading ? <Loader size={24} /> : 'Connect'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card elevation={3} sx={{ height: '100%', bgcolor: 'primary.light', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <AccountCircle sx={{ mr: 1 }} />
                  <Typography variant="h6">
                    Information
                  </Typography>
                </Box>
                
                <Divider sx={{ mb: 3, borderColor: 'rgba(255,255,255,0.2)' }} />
                
                <Typography variant="body1" paragraph>
                  This application requires an OpenAI API key to function. Your API key is used to:
                </Typography>
                
                <ul style={{ paddingLeft: '1.5rem' }}>
                  <li>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Process your data analysis requests securely
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Power the AI capabilities of the data analyst assistant
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Generate visualizations and insights from your data
                    </Typography>
                  </li>
                </ul>
                
                <Typography variant="body2" sx={{ mt: 2 }}>
                  Your API key is securely transmitted to our backend service and is not stored in your browser.
                </Typography>
                
                <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.2)' }} />
                
                <Typography variant="body2">
                  Don't have an OpenAI API key?{' '}
                  <Link 
                    href="https://platform.openai.com/api-keys" 
                    target="_blank" 
                    rel="noopener"
                    sx={{ color: 'white', fontWeight: 'bold', textDecoration: 'underline' }}
                  >
                    Get one here
                  </Link>
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </motion.div>
    </Container>
  );
};

export default LoginPage;