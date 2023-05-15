import type { ButtonProps } from '@mui/joy';
import { Box, Button, Divider, Modal, ModalDialog, Typography } from '@mui/joy';
import type { ReactNode } from 'react';
import { useState } from 'react';

export type ConfirmDialogProps = ButtonProps & {
  onConfirm: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  confirmText?: string;
};

export const ConfirmDialog = ({ onConfirm, title, description, children, confirmText = "I'm sure", ...props }: ConfirmDialogProps) => {
  const [open, setOpen] = useState<boolean>(false);
  return (
    <>
      <Button color='danger' variant='outlined' {...props} onClick={() => setOpen(true)}>
        {children}
      </Button>
      <Modal onClose={() => setOpen(false)} open={open}>
        <ModalDialog aria-describedby='alert-dialog-modal-description' aria-labelledby='alert-dialog-modal-title' role='alertdialog' variant='outlined'>
          <Typography component='h2' id='alert-dialog-modal-title'>
            {title}
          </Typography>
          <Divider />
          {description && (
            <Typography id='alert-dialog-modal-description' textColor='text.tertiary'>
              {description}
            </Typography>
          )}
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', pt: 2 }}>
            <Button color='neutral' onClick={() => setOpen(false)} variant='plain'>
              Cancel
            </Button>
            <Button
              color='danger'
              onClick={() => {
                setOpen(false);
                onConfirm();
              }}
              variant='solid'>
              {confirmText}
            </Button>
          </Box>
        </ModalDialog>
      </Modal>
    </>
  );
};
