/**
 * Test script to verify D3 transition functionality
 */

console.log('🧪 Testing D3 Transitions...\n');

try {
  // Test d3-selection and d3-transition integration
  const { select } = await import('d3-selection');
  await import('d3-transition'); // This should extend Selection prototype
  
  console.log('✅ D3 modules imported successfully');
  
  // Create a test SVG element in memory
  const svg = select(document.createElement('svg'));
  const rect = svg.append('rect');
  
  // Test if transition method exists
  if (typeof rect.transition === 'function') {
    console.log('✅ Selection.transition() method is available');
    
    // Test creating a transition
    const transition = rect.transition().duration(1000);
    if (transition) {
      console.log('✅ Transition created successfully');
      
      // Test if transition has expected methods
      if (typeof transition.attr === 'function') {
        console.log('✅ Transition.attr() method is available');
      } else {
        console.log('❌ Transition.attr() method is missing');
      }
      
      if (typeof transition.duration === 'function') {
        console.log('✅ Transition.duration() method is available');
      } else {
        console.log('❌ Transition.duration() method is missing');
      }
    } else {
      console.log('❌ Failed to create transition');
    }
  } else {
    console.log('❌ Selection.transition() method is not available');
    console.log('   Type of rect.transition:', typeof rect.transition);
  }
  
  // Test interrupt method
  if (typeof rect.interrupt === 'function') {
    console.log('✅ Selection.interrupt() method is available');
  } else {
    console.log('❌ Selection.interrupt() method is not available');
  }
  
  // Test data binding with transitions
  const testData = [{ value: 10 }, { value: 20 }];
  const bars = svg.selectAll('rect')
    .data(testData);
    
  const enterBars = bars.enter().append('rect');
  
  if (typeof enterBars.transition === 'function') {
    console.log('✅ Enter selection has transition method');
    
    const exitBars = bars.exit();
    if (typeof exitBars.transition === 'function') {
      console.log('✅ Exit selection has transition method');
    } else {
      console.log('❌ Exit selection missing transition method');
    }
  } else {
    console.log('❌ Enter selection missing transition method');
  }
  
  console.log('\n🎉 D3 Transition tests completed!');
  
} catch (error) {
  console.error('❌ D3 Transition test failed:', error);
  console.error('Stack trace:', error.stack);
}

// Test the bar chart renderer specifically
try {
  console.log('\n🧪 Testing Bar Chart Renderer...');
  
  const { renderBarChart, createBarChartScales } = await import('./renderers/bar-chart-renderer.js');
  
  console.log('✅ Bar chart renderer imported successfully');
  console.log('   - renderBarChart:', typeof renderBarChart);
  console.log('   - createBarChartScales:', typeof createBarChartScales);
  
} catch (error) {
  console.error('❌ Bar chart renderer test failed:', error);
  console.error('Stack trace:', error.stack);
}