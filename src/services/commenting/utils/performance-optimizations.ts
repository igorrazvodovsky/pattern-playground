import { useEffect, useRef, useCallback } from 'react';

/**
 * Performance optimization utilities for the commenting system
 */

/**
 * Debounce utility for reducing API calls
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Throttle utility for limiting event frequency
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let lastExecuted = 0;
  
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastExecuted > delay) {
      func(...args);
      lastExecuted = now;
    }
  };
};

/**
 * React hook for lazy loading components when they come into view
 */
export const useLazyLoad = (
  callback: () => void,
  options: IntersectionObserverInit = {}
) => {
  const targetRef = useRef<HTMLElement>(null);
  const hasLoaded = useRef(false);

  useEffect(() => {
    const target = targetRef.current;
    if (!target || hasLoaded.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasLoaded.current) {
            hasLoaded.current = true;
            callback();
            observer.unobserve(target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options,
      }
    );

    observer.observe(target);

    return () => {
      observer.unobserve(target);
    };
  }, [callback, options]);

  return targetRef;
};

/**
 * Hook for optimized search with debouncing
 */
export const useOptimizedSearch = <T>(
  searchFunction: (query: string) => T[],
  delay: number = 300
) => {
  const searchRef = useRef<string>('');
  const resultsRef = useRef<T[]>([]);

  const debouncedSearch = useCallback(
    debounce((query: string) => {
      if (query.trim() === '') {
        resultsRef.current = [];
        return;
      }
      
      const results = searchFunction(query);
      resultsRef.current = results;
    }, delay),
    [searchFunction, delay]
  );

  const search = useCallback((query: string) => {
    searchRef.current = query;
    debouncedSearch(query);
  }, [debouncedSearch]);

  return {
    search,
    results: resultsRef.current,
    currentQuery: searchRef.current,
  };
};

/**
 * Hook for batching multiple operations
 */
export const useBatchOperations = <T>(
  operation: (items: T[]) => Promise<void>,
  batchSize: number = 10,
  delay: number = 100
) => {
  const batchRef = useRef<T[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const processBatch = useCallback(async () => {
    if (batchRef.current.length === 0) return;

    const batch = [...batchRef.current];
    batchRef.current = [];
    
    try {
      await operation(batch);
    } catch (error) {
      console.error('Batch operation failed:', error);
    }
  }, [operation]);

  const addToBatch = useCallback((item: T) => {
    batchRef.current.push(item);

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Process immediately if batch is full
    if (batchRef.current.length >= batchSize) {
      processBatch();
      return;
    }

    // Otherwise, process after delay
    timeoutRef.current = setTimeout(processBatch, delay);
  }, [processBatch, batchSize, delay]);

  const flushBatch = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    processBatch();
  }, [processBatch]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    addToBatch,
    flushBatch,
    batchSize: batchRef.current.length,
  };
};

/**
 * Memory cleanup utilities
 */
export class MemoryManager {
  private cleanupTasks: (() => void)[] = [];
  private memoryThreshold: number = 50 * 1024 * 1024; // 50MB

  addCleanupTask(task: () => void): void {
    this.cleanupTasks.push(task);
  }

  runCleanup(): void {
    this.cleanupTasks.forEach(task => {
      try {
        task();
      } catch (error) {
        console.warn('Cleanup task failed:', error);
      }
    });
    this.cleanupTasks = [];
  }

  checkMemoryUsage(): void {
    if ('memory' in performance) {
      const memInfo = (performance as any).memory;
      if (memInfo.usedJSHeapSize > this.memoryThreshold) {
        console.warn('High memory usage detected, running cleanup...');
        this.runCleanup();
      }
    }
  }

  schedulePeriodicCleanup(interval: number = 300000): void { // 5 minutes
    setInterval(() => {
      this.checkMemoryUsage();
    }, interval);
  }
}

/**
 * Global memory manager instance
 */
export const memoryManager = new MemoryManager();

/**
 * Hook for automatic memory cleanup
 */
export const useMemoryCleanup = (cleanupTasks: (() => void)[]) => {
  useEffect(() => {
    cleanupTasks.forEach(task => {
      memoryManager.addCleanupTask(task);
    });

    return () => {
      // Run immediate cleanup on unmount
      cleanupTasks.forEach(task => {
        try {
          task();
        } catch (error) {
          console.warn('Component cleanup task failed:', error);
        }
      });
    };
  }, [cleanupTasks]);
};

/**
 * Hook for optimizing comment loading
 */
export const useOptimizedCommentLoading = (
  quoteId: string,
  loadComments: (id: string) => Promise<void>
) => {
  const hasLoaded = useRef(false);
  const loadingRef = useRef(false);

  const loadCommentsOptimized = useCallback(async () => {
    if (hasLoaded.current || loadingRef.current) return;

    loadingRef.current = true;
    try {
      await loadComments(quoteId);
      hasLoaded.current = true;
    } catch (error) {
      console.error('Failed to load comments:', error);
    } finally {
      loadingRef.current = false;
    }
  }, [quoteId, loadComments]);

  const targetRef = useLazyLoad(loadCommentsOptimized, {
    threshold: 0.1,
    rootMargin: '100px',
  });

  return {
    targetRef,
    hasLoaded: hasLoaded.current,
    isLoading: loadingRef.current,
  };
};