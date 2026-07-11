import { useCallback, useRef, useEffect } from 'react';
import { useModalService } from './useModalService';
import type { ModalOptions } from '../services/modal-service';
import type { PPModal } from '../components/modal/modal';

export interface ImperativeModalRef {
  open: (content: React.ReactElement, options?: ModalOptions) => void;
  close: () => void;
  update: (content: React.ReactElement) => void;
}

export const useImperativeModal = (type: 'drawer' | 'dialog' = 'drawer') => {
  const { openDrawer, openDialog, closeModal } = useModalService();
  const currentModalId = useRef<string | null>(null);
  const currentPPModal = useRef<PPModal | null>(null);

  const open = useCallback((content: React.ReactElement, options?: ModalOptions) => {
    // Close existing modal if open
    if (currentModalId.current) {
      closeModal(currentModalId.current);
    }

    // Open new modal
    const modalId = type === 'drawer' ? 
      openDrawer(content, options) : 
      openDialog(content, options);

    currentModalId.current = modalId;
  }, [type, openDrawer, openDialog, closeModal]);

  const close = useCallback(() => {
    if (currentModalId.current) {
      closeModal(currentModalId.current);
      currentModalId.current = null;
      currentPPModal.current = null;
    }
  }, [closeModal]);

  const update = useCallback((content: React.ReactElement) => {
    if (currentPPModal.current && currentModalId.current) {
      currentPPModal.current.updateReactContent(content);
    }
  }, []);

  // Effect to find and store PPModal reference when modal ID changes
  useEffect(() => {
    if (!currentModalId.current) {
      currentPPModal.current = null;
      return;
    }

    // Find the PPModal element
    const modalElement = document.getElementById(currentModalId.current);
    currentPPModal.current = modalElement?.closest('pp-modal') as PPModal;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (currentModalId.current) {
        closeModal(currentModalId.current);
      }
    };
  }, [closeModal]);

  return { open, close, update };
};