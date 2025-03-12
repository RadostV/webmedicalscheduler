import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';

interface ModalProps {
  open: boolean;
  title: string;
  message?: string;
  onConfirm?: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  customActions?: React.ReactNode;
  children?: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  customActions,
  children,
}) => {
  return (
    <Dialog open={open} onClose={onCancel}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        {message && <DialogContentText>{message}</DialogContentText>}
        {children}
      </DialogContent>
      <DialogActions>
        {customActions || (
          <>
            <Button onClick={onCancel} color="inherit">
              {cancelText}
            </Button>
            {onConfirm && (
              <Button onClick={onConfirm} color="primary" autoFocus>
                {confirmText}
              </Button>
            )}
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default Modal;
