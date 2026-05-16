import React, { createContext, useContext, useMemo } from 'react';
import type { ContentAdapter, BaseItem, ViewScope } from './types';
import { validateAdapter } from './utils/validation';

interface ContentAdapterContextValue {
  adapters: Map<string, ContentAdapter>;
  registerAdapter: <T extends BaseItem>(adapter: ContentAdapter<T>) => void;
  getAdapter: (contentType: string) => ContentAdapter | undefined;
  
  // Enhanced capabilities
  validateContentType: (contentType: string) => boolean;
  getSupportedScopes: (contentType: string) => ViewScope[];
  supportsCommenting: (contentType: string) => boolean;
}

const ContentAdapterContext = createContext<ContentAdapterContextValue | null>(null);

interface ContentAdapterProviderProps {
  children: React.ReactNode;
  adapters?: ContentAdapter[];
}

export const ContentAdapterProvider: React.FC<ContentAdapterProviderProps> = ({
  children,
  adapters: initialAdapters = [],
}) => {
  const value = useMemo(() => {
    const adapters = new Map<string, ContentAdapter>();
    
    // Register initial adapters with validation
    initialAdapters.forEach(adapter => {
      validateAdapter(adapter);
      adapters.set(adapter.contentType, adapter);
    });

    return {
      adapters,
      registerAdapter: <T extends BaseItem>(adapter: ContentAdapter<T>) => {
        validateAdapter(adapter);
        adapters.set(adapter.contentType, adapter as ContentAdapter);
      },
      getAdapter: (contentType: string) => adapters.get(contentType),
      validateContentType: (contentType: string) => adapters.has(contentType),
      getSupportedScopes: (contentType: string) => {
        const adapter = adapters.get(contentType);
        return adapter?.supportedScopes || ['mini', 'mid', 'maxi'];
      },
      supportsCommenting: (contentType: string) => {
        const adapter = adapters.get(contentType);
        return adapter?.supportsCommenting || false;
      },
    };
  }, [initialAdapters]);

  return (
    <ContentAdapterContext.Provider value={value}>
      {children}
    </ContentAdapterContext.Provider>
  );
};

export const useContentAdapterContext = (): ContentAdapterContextValue => {
  const context = useContext(ContentAdapterContext);
  if (!context) {
    throw new Error('useContentAdapterContext must be used within a ContentAdapterProvider');
  }
  return context;
};

export const useContentAdapter = (contentType: string): ContentAdapter | undefined => {
  const { getAdapter } = useContentAdapterContext();
  return getAdapter(contentType);
};

export const useRegisterAdapter = () => {
  const { registerAdapter } = useContentAdapterContext();
  return registerAdapter;
};