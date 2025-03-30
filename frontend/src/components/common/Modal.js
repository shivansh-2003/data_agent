import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import Button from './Button';
import styled from 'styled-components';

const StyledDialog = styled(Dialog)`
  .MuiDialog-paper {
    border-radius: 16px;
    padding: 8px;
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
  }
`;

const StyledDialogTitle = styled(DialogTitle)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
`;

const Modal = ({ open, onClose, title, children, actions, maxWidth = 'sm', fullWidth = true }) => {
  return (
    <StyledDialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
    >
      <StyledDialogTitle>
        {title}
        <IconButton edge="end" color="inherit" onClick={onClose} aria-label="close">
          <CloseIcon />
        </IconButton>
      </StyledDialogTitle>
      <DialogContent dividers>
        {children}
      </DialogContent>
      {actions && (
        <DialogActions>
          {actions}
        </DialogActions>
      )}
    </StyledDialog>
  );
};

export default Modal;