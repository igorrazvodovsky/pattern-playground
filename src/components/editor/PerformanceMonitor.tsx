import { useEffect, useState, useRef } from 'react';
import { useEditorContext } from './EditorProvider';

interface PerformanceMetrics {
  pluginLoadTime: Map<string, number>;
  eventProcessingTime: Map<string, number[]>;
  renderCount: number;
  memoryUsage?: number;
  activePlugins: number;
  totalEvents: number;
}

interface PerformanceMonitorProps {
  enabled?: boolean;
  sampleRate?: number; // Sample every N events
  maxEventHistory?: number;
  onMetricsUpdate?: (metrics: PerformanceMetrics) => void;
}

/**
 * Performance monitoring component for the editor plugin system.
 * Tracks plugin load times, event processing, and resource usage.
 */
export function PerformanceMonitor({ 
  enabled = true,
  sampleRate = 10,
  maxEventHistory = 100,
  onMetricsUpdate
}: PerformanceMonitorProps) {
  const context = useEditorContext();
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    pluginLoadTime: new Map(),
    eventProcessingTime: new Map(),
    renderCount: 0,
    activePlugins: 0,
    totalEvents: 0,
  });
  
  const eventCounter = useRef(0);
  const renderCounter = useRef(0);

  useEffect(() => {
    if (!enabled) return;

    const originalEmit = context.eventBus.emit.bind(context.eventBus);
    const originalOn = context.eventBus.on.bind(context.eventBus);
    
    // Monitor event emissions
    context.eventBus.emit = function(event: string, payload: any) {
      eventCounter.current++;
      
      if (eventCounter.current % sampleRate === 0) {
        const startTime = performance.now();
        const result = originalEmit(event, payload);
        const endTime = performance.now();
        
        setMetrics(prev => {
          const newMetrics = { ...prev };
          const times = newMetrics.eventProcessingTime.get(event) || [];
          times.push(endTime - startTime);
          
          // Keep only recent history
          if (times.length > maxEventHistory) {
            times.shift();
          }
          
          newMetrics.eventProcessingTime.set(event, times);
          newMetrics.totalEvents = eventCounter.current;
          return newMetrics;
        });
        
        return result;
      }
      
      return originalEmit(event, payload);
    };

    // Monitor plugin registration
    const originalRegister = context.registry.register.bind(context.registry);
    context.registry.register = async function(plugin: any) {
      const startTime = performance.now();
      
      try {
        const result = await originalRegister(plugin);
        const loadTime = performance.now() - startTime;
        
        setMetrics(prev => {
          const newMetrics = { ...prev };
          newMetrics.pluginLoadTime.set(plugin.id, loadTime);
          newMetrics.activePlugins = context.registry.getAll().length;
          return newMetrics;
        });
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`Plugin ${plugin.id} loaded in ${loadTime.toFixed(2)}ms`);
        }
        
        return result;
      } catch (error) {
        const loadTime = performance.now() - startTime;
        console.error(`Plugin ${plugin.id} failed to load after ${loadTime.toFixed(2)}ms`);
        throw error;
      }
    };

    // Monitor memory usage (if available)
    if ('memory' in performance) {
      const memoryInterval = setInterval(() => {
        const memory = (performance as any).memory;
        if (memory) {
          setMetrics(prev => ({
            ...prev,
            memoryUsage: memory.usedJSHeapSize / 1048576, // Convert to MB
          }));
        }
      }, 5000);

      return () => {
        clearInterval(memoryInterval);
        context.eventBus.emit = originalEmit;
        context.eventBus.on = originalOn;
        context.registry.register = originalRegister;
      };
    }

    return () => {
      context.eventBus.emit = originalEmit;
      context.eventBus.on = originalOn;
      context.registry.register = originalRegister;
    };
  }, [enabled, context, sampleRate, maxEventHistory]);

  // Track render count
  useEffect(() => {
    renderCounter.current++;
    setMetrics(prev => ({
      ...prev,
      renderCount: renderCounter.current,
    }));
  });

  // Notify parent of metrics updates
  useEffect(() => {
    if (onMetricsUpdate) {
      onMetricsUpdate(metrics);
    }
  }, [metrics, onMetricsUpdate]);

  if (!enabled) return null;

  return null; // This is a monitoring component, no UI
}

/**
 * Hook to access performance metrics
 */
export function usePerformanceMetrics(): PerformanceMetrics | null {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);

  useEffect(() => {
    // Access metrics from window if in development mode
    if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
      const interval = setInterval(() => {
        const editorDebug = (window as any).__editorDebug;
        if (editorDebug?.performance) {
          setMetrics(editorDebug.performance);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, []);

  return metrics;
}

/**
 * Performance dashboard component for development
 */
export function PerformanceDashboard() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    pluginLoadTime: new Map(),
    eventProcessingTime: new Map(),
    renderCount: 0,
    activePlugins: 0,
    totalEvents: 0,
  });

  const calculateAverageEventTime = (times: number[]): number => {
    if (times.length === 0) return 0;
    return times.reduce((a, b) => a + b, 0) / times.length;
  };

  const getSlowEvents = (): Array<[string, number]> => {
    const slowEvents: Array<[string, number]> = [];
    
    metrics.eventProcessingTime.forEach((times, event) => {
      const avg = calculateAverageEventTime(times);
      if (avg > 10) { // Events taking more than 10ms
        slowEvents.push([event, avg]);
      }
    });
    
    return slowEvents.sort((a, b) => b[1] - a[1]).slice(0, 5);
  };

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'rgba(0, 0, 0, 0.8)',
      color: '#0f0',
      padding: '10px',
      borderRadius: '5px',
      fontFamily: 'monospace',
      fontSize: '12px',
      zIndex: 9999,
      minWidth: '250px',
    }}>
      <div style={{ marginBottom: '10px', borderBottom: '1px solid #0f0', paddingBottom: '5px' }}>
        <strong>🎯 Performance Monitor</strong>
      </div>
      
      <div style={{ marginBottom: '5px' }}>
        <strong>Plugins:</strong> {metrics.activePlugins} active
      </div>
      
      <div style={{ marginBottom: '5px' }}>
        <strong>Events:</strong> {metrics.totalEvents} processed
      </div>
      
      <div style={{ marginBottom: '5px' }}>
        <strong>Renders:</strong> {metrics.renderCount}
      </div>
      
      {metrics.memoryUsage && (
        <div style={{ marginBottom: '5px' }}>
          <strong>Memory:</strong> {metrics.memoryUsage.toFixed(2)} MB
        </div>
      )}
      
      {metrics.pluginLoadTime.size > 0 && (
        <div style={{ marginTop: '10px', marginBottom: '5px' }}>
          <strong>Plugin Load Times:</strong>
          {Array.from(metrics.pluginLoadTime.entries()).map(([plugin, time]) => (
            <div key={plugin} style={{ paddingLeft: '10px', fontSize: '11px' }}>
              {plugin}: {time.toFixed(2)}ms
            </div>
          ))}
        </div>
      )}
      
      {getSlowEvents().length > 0 && (
        <div style={{ marginTop: '10px' }}>
          <strong>Slow Events:</strong>
          {getSlowEvents().map(([event, time]) => (
            <div key={event} style={{ 
              paddingLeft: '10px', 
              fontSize: '11px',
              color: time > 50 ? '#f00' : time > 20 ? '#ff0' : '#0f0'
            }}>
              {event}: {time.toFixed(2)}ms
            </div>
          ))}
        </div>
      )}
      
      <PerformanceMonitor 
        enabled={true}
        sampleRate={5}
        onMetricsUpdate={setMetrics}
      />
    </div>
  );
}

/**
 * Utility to measure plugin operation performance
 */
export class PluginPerformanceTracker {
  private marks: Map<string, number> = new Map();
  private measures: Map<string, number[]> = new Map();

  mark(label: string): void {
    this.marks.set(label, performance.now());
  }

  measure(label: string, startMark: string): number {
    const start = this.marks.get(startMark);
    if (!start) {
      console.warn(`No mark found for ${startMark}`);
      return 0;
    }

    const duration = performance.now() - start;
    const measures = this.measures.get(label) || [];
    measures.push(duration);
    this.measures.set(label, measures);

    return duration;
  }

  getAverageTime(label: string): number {
    const measures = this.measures.get(label);
    if (!measures || measures.length === 0) return 0;
    
    return measures.reduce((a, b) => a + b, 0) / measures.length;
  }

  getReport(): Record<string, { count: number; average: number; total: number }> {
    const report: Record<string, { count: number; average: number; total: number }> = {};
    
    this.measures.forEach((times, label) => {
      const total = times.reduce((a, b) => a + b, 0);
      report[label] = {
        count: times.length,
        average: total / times.length,
        total,
      };
    });

    return report;
  }

  reset(): void {
    this.marks.clear();
    this.measures.clear();
  }
}