import React from 'react';
import { renderToString } from 'react-dom/server';
import { ContentAdapterProvider } from '../ContentAdapterRegistry';

/**
 * Temporary utility to render React components to HTML strings
 * for integration with the existing string-based modal service
 */
export const renderReactToHtmlString = (component: React.ReactNode): string => {
  try {
    // Wrap component with necessary providers for server-side rendering
    const wrappedComponent = (
      <ContentAdapterProvider>
        {component}
      </ContentAdapterProvider>
    );
    
    return renderToString(wrappedComponent as React.ReactElement);
  } catch (error) {
    console.error('Failed to render React component to string:', error);
    return '<div>Error rendering component</div>';
  }
};