// Lazy bridge from React demos into the toast runtime, so the toast module
// stays out of the demo's eager bundle.

export const showToast = async (text: string, onClick?: () => void) => {
  const { PpToast } = await import('../components/toast/toast');
  return PpToast.show(text, onClick);
};
