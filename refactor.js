import fs from 'fs';
import path from 'path';

const dir = 'apps/api/src/controllers';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.ts'));

files.forEach(f => {
  const p = path.join(dir, f);
  let content = fs.readFileSync(p, 'utf8');

  if (!content.includes('asyncHandler')) {
    content = 'import { asyncHandler } from "../middleware/asyncHandler.js";\n' + content;
  }

  // Regex to match the export function ... { try { ... } catch (err) { next(err); } }
  // It handles both async and non-async functions
  content = content.replace(
    /export\s+(async\s+)?function\s+(\w+)\s*\(([^)]+)\)\s*\{[\s\S]*?try\s*\{([\s\S]*?)\}\s*catch\s*\([^)]+\)\s*\{\s*next\([^)]+\);?\s*\}\s*\}/g,
    (match, isAsync, name, args, body) => {
      let cleanArgs = args.split(',').map(a => a.trim()).filter(a => !a.includes('NextFunction')).join(', ');
      // some args might have been multi-line, let's keep it simple
      if (cleanArgs.endsWith(',')) cleanArgs = cleanArgs.slice(0, -1);
      
      return `export const ${name} = asyncHandler(async (${cleanArgs}) => {\n${body}\n});`;
    }
  );

  // Clean up any NextFunction imports
  content = content.replace(/,\s*NextFunction\s*/g, '');
  content = content.replace(/NextFunction\s*,\s*/g, '');

  fs.writeFileSync(p, content, 'utf8');
});
console.log("Controllers refactored successfully.");
