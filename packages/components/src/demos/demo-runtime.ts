// Lazy bridges from React demos into web-component runtime, so the heavy
// component/service modules stay out of the demo's eager bundle.

export const showToast = async (text: string, onClick?: () => void) => {
  const { PpToast } = await import('../components/toast/toast');
  return PpToast.show(text, onClick);
};

export const getModalService = async () => (await import('../services/modal-service')).modalService;
