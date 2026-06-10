import * as fs from 'fs';
import * as path from 'path';

/**
 * Load api/.env into process.env before config.ts is evaluated.
 * Does not override variables already set in the environment.
 */
export const loadEnvFile = (): void => {
  const envPaths = [
    path.join(__dirname, '..', '.env'),
    path.join(process.cwd(), '.env'),
    '.env',
  ];

  for (const envPath of envPaths) {
    if (!fs.existsSync(envPath)) continue;

    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach((line) => {
      const trimmedLine = line.trim();
      if (!trimmedLine || trimmedLine.startsWith('#')) return;

      const equalIndex = trimmedLine.indexOf('=');
      if (equalIndex <= 0) return;

      const key = trimmedLine.substring(0, equalIndex).trim();
      let value = trimmedLine.substring(equalIndex + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (key && !process.env[key]) {
        process.env[key] = value;
      }
    });
    break;
  }
};

loadEnvFile();
