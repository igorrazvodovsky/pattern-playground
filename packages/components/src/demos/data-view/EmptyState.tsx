import React from 'react';

export interface EmptyStateProps {
  icon: string;
  title: string;
  message: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, message }) => {
  return (
    <div className="empty-state border flow">
      <iconify-icon className="empty-state__icon" icon={icon}></iconify-icon>
      <h3>{title}</h3>
      <p>{message}</p>
    </div>
  );
};