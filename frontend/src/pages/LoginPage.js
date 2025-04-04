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
import { Api, AccountCircle, SmartToy } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/common/Loader';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading, login, error } = useAuth();
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
    
    setLocalError('');
    setIsSubmitting(true);
    
    try {
      await login(model, agentType);
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
            Select your model and agent type to start analyzing your data
          </Typography>
        </Box>
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Card elevation={3} sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Api color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">
                    AI Connection
                  </Typography>
                </Box>
                
                <Divider sx={{ mb: 3 }} />
                
                <form onSubmit={handleSubmit}>
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
                  <SmartToy sx={{ mr: 1 }} />
                  <Typography variant="h6">
                    Information
                  </Typography>
                </Box>
                
                <Divider sx={{ mb: 3, borderColor: 'rgba(255,255,255,0.2)' }} />
                
                <Typography variant="body1" paragraph>
                  This application provides AI-powered data analysis capabilities. You can:
                </Typography>
                
                <ul style={{ paddingLeft: '1.5rem' }}>
                  <li>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Upload your data for AI-powered analysis
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Generate insightful visualizations and interpretations
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Discover patterns and trends in your data
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Ask questions about your data in natural language
                    </Typography>
                  </li>
                </ul>
                
                <Typography variant="body2" sx={{ mt: 2 }}>
                  The API keys are securely managed on our servers - no need to provide your own!
                </Typography>
                
                <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.2)' }} />
                
                <Typography variant="body2">
                  This application is powered by advanced AI models from OpenAI.
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