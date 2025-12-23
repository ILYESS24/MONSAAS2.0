#!/usr/bin/env node

// ============================================
// SCRIPT DE REMPLACEMENT DES CONSOLE.LOG
// Remplace automatiquement console.log par logger
// ============================================

const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '..', 'src');
const filesProcessed = [];

// Patterns à remplacer
const replacements = [
  // console.log → logger.debug
  {
    pattern: /\bconsole\.log\s*\(/g,
    replacement: 'logger.debug(',
    type: 'debug'
  },
  // console.info → logger.info
  {
    pattern: /\bconsole\.info\s*\(/g,
    replacement: 'logger.info(',
    type: 'info'
  },
  // console.warn → logger.warn
  {
    pattern: /\bconsole\.warn\s*\(/g,
    replacement: 'logger.warn(',
    type: 'warn'
  },
  // console.error → logger.error
  {
    pattern: /\bconsole\.error\s*\(/g,
    replacement: 'logger.error(',
    type: 'error'
  },
  // Garder console.error pour les vraies erreurs
  {
    pattern: /\blogger\.error\s*\(\s*([^,)]+)\s*\)\s*;/g,
    replacement: 'logger.error($1, error);',
    type: 'error_with_context'
  }
];

function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;
    let originalContent = content;

    // Appliquer chaque remplacement
    replacements.forEach(({ pattern, replacement, type }) => {
      if (pattern.test(content)) {
        content = content.replace(pattern, replacement);
        hasChanges = true;
      }
    });

    // Ajouter l'import du logger si nécessaire
    if (hasChanges && !content.includes("import { logger }")) {
      // Trouver la ligne d'import existante
      const importMatch = content.match(/import\s+{[^}]*}\s+from\s+['"`]@\/services\/[^'"`]*['"`];?/);
      if (importMatch) {
        // Ajouter logger à l'import existant depuis services
        content = content.replace(
          /import\s+{([^}]*)}\s+from\s+['"`]@\/services\/[^'"`]*['"`];?/,
          (match, imports) => {
            if (!imports.includes('logger')) {
              return match.replace(imports, `${imports}, logger`);
            }
            return match;
          }
        );
      } else {
        // Ajouter un nouvel import
        const firstImport = content.indexOf("import ");
        if (firstImport !== -1) {
          const insertPoint = content.indexOf('\n', firstImport) + 1;
          content = content.slice(0, insertPoint) +
            "import { logger } from '@/services/logger';\n" +
            content.slice(insertPoint);
        }
      }
    }

    if (hasChanges) {
      fs.writeFileSync(filePath, content, 'utf8');
      filesProcessed.push(filePath);

      // Compter les remplacements
      const changeCount = replacements.reduce((count, { pattern }) => {
        const matches = originalContent.match(pattern);
        return count + (matches ? matches.length : 0);
      }, 0);

      console.log(`✅ ${filePath}: ${changeCount} remplacements`);
    }

  } catch (error) {
    console.error(`❌ Erreur traitement ${filePath}:`, error.message);
  }
}

function walkDirectory(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      walkDirectory(filePath);
    } else if (stat.isFile() && (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx'))) {
      processFile(filePath);
    }
  }
}

console.log('🚀 Starting console.log replacement...\n');

// Traiter tous les fichiers TypeScript/JavaScript
walkDirectory(targetDir);

console.log(`\n🎉 Replacement complete!`);
console.log(`📁 Files processed: ${filesProcessed.length}`);

if (filesProcessed.length > 0) {
  console.log('\n📋 Files modified:');
  filesProcessed.forEach(file => console.log(`   ${file}`));
}

console.log('\n⚠️  IMPORTANT: Review the changes and test thoroughly!');
console.log('🔧 Make sure to import { logger } from "@/services/logger" in files that use logging.');
