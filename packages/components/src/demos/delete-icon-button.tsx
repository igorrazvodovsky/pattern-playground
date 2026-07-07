import '../jsx-types';

export function DeleteIconButton({ onClick, label = 'Delete' }: { onClick: () => void; label?: string }) {
  return (
    <button slot="suffix" className="button button--plain button--small" onClick={onClick}>
      <iconify-icon className="icon" icon="ph:trash-simple" />
      <span className="inclusively-hidden">{label}</span>
    </button>
  );
}
