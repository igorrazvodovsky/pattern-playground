import { useCallback } from 'react';
import { modalService, type ModalOptions } from '../services/modal-service';

export interface UseModalServiceReturn {
  openDrawer: (content: React.ReactElement, options?: ModalOptions) => string;
  openDialog: (content: React.ReactElement, options?: ModalOptions) => string;
  closeModal: (id: string) => void;
  closeAll: () => void;
}

export const useModalService = (): UseModalServiceReturn => {
  const openDrawer = useCallback((content: React.ReactElement, options?: ModalOptions) => {
    return modalService.openDrawer(content, options);
  }, []);

  const openDialog = useCallback((content: React.ReactElement, options?: ModalOptions) => {
    return modalService.openDialog(content, options);
  }, []);

  const closeModal = useCallback((id: string) => {
    modalService.closeModal(id);
  }, []);

  const closeAll = useCallback(() => {
    modalService.closeAll();
  }, []);

  return {
    openDrawer,
    openDialog,
    closeModal,
    closeAll
  };
};