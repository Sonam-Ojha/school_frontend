const fs = require('fs');

// All files with apostrophe issues
const files = [
  'src/features/landing/content.ts',
  'src/features/landing/catalog.ts',
  'src/features/landing/pages/ContactPage.tsx',
  'src/features/landing/pages/AboutPage.tsx',
  'src/features/landing/pages/PricingPage.tsx',
  'src/features/landing/pages/FeaturesPage.tsx',
];

files.forEach(filePath => {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const original = content;
    const lines = content.split('\n');

    const fixed = lines.map(line => {
      // Only process lines that are string literals (inside quotes)
      // Find single-quoted strings and escape apostrophes inside them
      // Strategy: replace 'text's text' pattern where apostrophe is inside a string

      // Replace unescaped apostrophes inside single-quoted strings
      // We do this by converting the whole file's problematic patterns
      // Simple approach: find 'word's and escape it
      return line
        // Fix: school's, student's, parent's, teacher's, child's, person's, etc.
        .replace(/'([^']*)'s ([^']*)'/, "'$1\\'s $2'")
        .replace(/'([^']*)'s ([^']*)'/, "'$1\\'s $2'") // double pass
        // Fix doesn't, won't, it's, etc.
        .replace(/'([^']*)'t ([^']*)'/, "'$1\\'t $2'")
        .replace(/'([^']*)'t ([^']*)'/, "'$1\\'t $2'");
    });

    content = fixed.join('\n');
    
    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Fixed:', filePath);
    } else {
      console.log('No change:', filePath);
    }
  } catch(e) {
    console.error('Error:', filePath, e.message);
  }
});

console.log('\nDone. Now run: npm run build');
