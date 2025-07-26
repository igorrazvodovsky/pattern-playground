/**
 * Verification script for charts implementation
 * Tests if D3 modules can be imported and basic functionality works
 */

console.log('🧪 Verifying D3.js Charts Implementation...\n');

// Test D3 module imports
try {
  // Core modules
  const d3Selection = await import('d3-selection');
  const d3Scale = await import('d3-scale');
  const d3Array = await import('d3-array');
  
  console.log('✅ Core D3 modules imported successfully');
  console.log('   - d3-selection:', typeof d3Selection.select);
  console.log('   - d3-scale:', typeof d3Scale.scaleLinear);
  console.log('   - d3-array:', typeof d3Array.max);
  
  // Shape modules
  const d3Shape = await import('d3-shape');
  console.log('✅ D3 shape module imported successfully');
  console.log('   - d3-shape:', typeof d3Shape.line);
  
  // Animation modules
  const d3Transition = await import('d3-transition');
  const d3Ease = await import('d3-ease');
  console.log('✅ D3 animation modules imported successfully');
  console.log('   - d3-transition:', typeof d3Transition.transition);
  console.log('   - d3-ease:', typeof d3Ease.easeLinear);
  
  // Hierarchy modules
  const d3Hierarchy = await import('d3-hierarchy');
  console.log('✅ D3 hierarchy module imported successfully');
  console.log('   - d3-hierarchy:', typeof d3Hierarchy.hierarchy);
  
  // Format modules
  const d3Format = await import('d3-format');
  const d3TimeFormat = await import('d3-time-format');
  console.log('✅ D3 format modules imported successfully');
  console.log('   - d3-format:', typeof d3Format.format);
  console.log('   - d3-time-format:', typeof d3TimeFormat.timeFormat);
  
} catch (error) {
  console.error('❌ Failed to import D3 modules:', error.message);
  process.exit(1);
}

// Test chart types
try {
  const chartTypes = await import('./base/chart-types.js');
  console.log('\n✅ Chart types imported successfully');
  console.log('   - isBarChartData:', typeof chartTypes.isBarChartData);
  console.log('   - isLineChartData:', typeof chartTypes.isLineChartData);
} catch (error) {
  console.error('❌ Failed to import chart types:', error.message);
  process.exit(1);
}

// Test data converters
try {
  const converters = await import('./base/data-converters.js');
  console.log('✅ Data converters imported successfully');
  console.log('   - convertToBarChartData:', typeof converters.convertToBarChartData);
} catch (error) {
  console.error('❌ Failed to import data converters:', error.message);
  process.exit(1);
}

// Test bar chart renderer
try {
  const barRenderer = await import('./renderers/bar-chart-renderer.js');
  console.log('✅ Bar chart renderer imported successfully');
  console.log('   - renderBarChart:', typeof barRenderer.renderBarChart);
  console.log('   - createBarChartScales:', typeof barRenderer.createBarChartScales);
} catch (error) {
  console.error('❌ Failed to import bar chart renderer:', error.message);
  process.exit(1);
}

// Test functional data conversion
try {
  const { convertToBarChartData } = await import('./base/data-converters.js');
  
  const testData = [
    { category: 'A', value: 10 },
    { category: 'B', value: 20 },
    { category: 'C', value: 15 }
  ];
  
  const converted = convertToBarChartData(testData);
  if (converted && converted.data.length === 3) {
    console.log('✅ Data conversion working correctly');
    console.log('   Sample converted data:', JSON.stringify(converted.data[0], null, 2));
  } else {
    throw new Error('Data conversion failed');
  }
} catch (error) {
  console.error('❌ Data conversion test failed:', error.message);
  process.exit(1);
}

// Test basic D3 functionality
try {
  const { scaleLinear } = await import('d3-scale');
  const { select } = await import('d3-selection');
  
  const scale = scaleLinear().domain([0, 100]).range([0, 400]);
  if (scale(50) === 200) {
    console.log('✅ D3 scales working correctly');
  } else {
    throw new Error('D3 scale test failed');
  }
} catch (error) {
  console.error('❌ D3 functionality test failed:', error.message);
  process.exit(1);
}

console.log('\n🎉 All verification tests passed!');
console.log('📊 Charts implementation is ready for use.');
console.log('\nNext steps:');
console.log('1. Run `npm install` to install dependencies');
console.log('2. Start Storybook with `npm run storybook`');
console.log('3. Navigate to "Data visualization/Bar Chart" to see the component');