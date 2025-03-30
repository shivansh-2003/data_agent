import React from 'react';
import { Box, Typography, Link, Container, Divider } from '@mui/material';
import styled from 'styled-components';

const FooterContainer = styled(Box)`
  background-color: #f8f9fa;
  padding: 24px 0;
  margin-top: auto;
`;

const FooterContent = styled(Container)`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const FooterLinks = styled(Box)`
  display: flex;
  gap: 24px;
  margin-bottom: 16px;
`;

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <FooterContainer component="footer">
      <FooterContent maxWidth="lg">
        <FooterLinks>
          <Link href="#" color="textSecondary" underline="hover">About</Link>
          <Link href="#" color="textSecondary" underline="hover">Documentation</Link>
          <Link href="#" color="textSecondary" underline="hover">Privacy Policy</Link>
          <Link href="#" color="textSecondary" underline="hover">Terms of Service</Link>
        </FooterLinks>
        <Divider sx={{ width: '100%', mb: 2 }} />
        <Typography variant="body2" color="textSecondary" align="center">
          © {currentYear} Data Analyst AI. All rights reserved.
        </Typography>
      </FooterContent>
    </FooterContainer>
  );
};

export default Footer;