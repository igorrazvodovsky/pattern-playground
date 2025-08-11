import React, { createContext, useContext, useMemo } from 'react';
import type { ContentAdapter, BaseItem } from './types';

interface ContentAdapterContextValue {
  adapters: Map<string, ContentAdapter>;
  registerAdapter: <T extends BaseItem>(adapter: ContentAdapter<T>) => void;
  getAdapter: (contentType: string) => ContentAdapter | undefined;
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
    
    // Register initial adapters
    initialAdapters.forEach(adapter => {
      adapters.set(adapter.contentType, adapter);
    });

    return {
      adapters,
      registerAdapter: <T extends BaseItem>(adapter: ContentAdapter<T>) => {
        adapters.set(adapter.contentType, adapter as ContentAdapter);
      },
      getAdapter: (contentType: string) => adapters.get(contentType),
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