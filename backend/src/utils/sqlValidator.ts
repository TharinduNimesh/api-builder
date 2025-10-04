/**
 * SQL Validator - Comprehensive security checks for SQL Editor
 * Blocks system-level database access and dangerous operations
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validates SQL query for security and safety
 * Blocks: system catalog access, Sys* tables, dangerous commands
 */
export function validateSQL(sql: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!sql || typeof sql !== 'string') {
    errors.push('SQL query is required');
    return { isValid: false, errors, warnings };
  }

  const trimmedSQL = sql.trim();
  if (trimmedSQL.length === 0) {
    errors.push('SQL query cannot be empty');
    return { isValid: false, errors, warnings };
  }

  // Normalize SQL for checking (remove comments, extra whitespace)
  const normalizedSQL = normalizeSQL(trimmedSQL);

  // 1. Block system catalog access
  if (hasSystemCatalogAccess(normalizedSQL)) {
    errors.push('Access to system catalogs (pg_*, pg_catalog, information_schema) is not allowed');
  }

  // 2. Block Sys* table access
  if (hasSysTableAccess(normalizedSQL)) {
    errors.push('Direct access to system tables (Sys*) is not allowed');
  }

  // 3. Block dangerous commands
  const dangerousCommand = checkDangerousCommands(normalizedSQL);
  if (dangerousCommand) {
    errors.push(`Dangerous command detected: ${dangerousCommand}`);
  }

  // 4. Block file operations
  if (hasFileOperations(normalizedSQL)) {
    errors.push('File operations (COPY, pg_read_file, pg_ls_dir, etc.) are not allowed');
  }

  // 5. Block extension operations
  if (hasExtensionOperations(normalizedSQL)) {
    errors.push('Extension management operations are not allowed');
  }

  // 6. Block role/user management
  if (hasRoleManagement(normalizedSQL)) {
    errors.push('Role and user management operations are not allowed');
  }

  // 7. Warn about potentially dangerous operations
  if (hasDropCommand(normalizedSQL)) {
    warnings.push('DROP command detected - use with caution');
  }

  if (hasTruncateCommand(normalizedSQL)) {
    warnings.push('TRUNCATE command detected - this will delete all data');
  }

  if (hasAlterCommand(normalizedSQL)) {
    warnings.push('ALTER command detected - schema changes can affect application');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Normalize SQL by removing comments and extra whitespace
 */
function normalizeSQL(sql: string): string {
  // Remove single-line comments (-- comment)
  let normalized = sql.replace(/--[^\n]*\n/g, '\n');
  
  // Remove multi-line comments (/* comment */)
  normalized = normalized.replace(/\/\*[\s\S]*?\*\//g, ' ');
  
  // Normalize whitespace
  normalized = normalized.replace(/\s+/g, ' ').trim();
  
  return normalized;
}

/**
 * Check for system catalog access (pg_*, pg_catalog.*, information_schema.*)
 */
function hasSystemCatalogAccess(sql: string): boolean {
  const patterns = [
    /\b(from|join|into|update|delete\s+from)\s+(["\`]?pg_\w+|pg_catalog\.\w+|information_schema\.\w+)/gi,
    /\b(from|join|into|update|delete\s+from)\s+(["\`]?pg_catalog["\`]?\.|["\`]?information_schema["\`]?\.)/gi,
    /\bpg_read_file\s*\(/gi,
    /\bpg_ls_dir\s*\(/gi,
    /\bpg_stat_file\s*\(/gi,
  ];

  return patterns.some(pattern => pattern.test(sql));
}

/**
 * Check for Sys* table access (our system tables)
 */
function hasSysTableAccess(sql: string): boolean {
  const patterns = [
    /\b(from|join|into|update|delete\s+from|insert\s+into)\s+(["\`]?sys\w+)/gi,
    /\b(from|join|into|update|delete\s+from|insert\s+into)\s+(["\`]?public["\`]?\.["\`]?sys\w+)/gi,
  ];

  return patterns.some(pattern => pattern.test(sql));
}

/**
 * Check for dangerous commands
 */
function checkDangerousCommands(sql: string): string | null {
  const dangerous = [
    { pattern: /\bcreate\s+extension\b/gi, name: 'CREATE EXTENSION' },
    { pattern: /\bdrop\s+extension\b/gi, name: 'DROP EXTENSION' },
    { pattern: /\balter\s+system\b/gi, name: 'ALTER SYSTEM' },
    { pattern: /\bset\s+role\b/gi, name: 'SET ROLE' },
    { pattern: /\bcreate\s+role\b/gi, name: 'CREATE ROLE' },
    { pattern: /\bdrop\s+role\b/gi, name: 'DROP ROLE' },
    { pattern: /\balter\s+role\b/gi, name: 'ALTER ROLE' },
    { pattern: /\bcreate\s+user\b/gi, name: 'CREATE USER' },
    { pattern: /\bdrop\s+user\b/gi, name: 'DROP USER' },
    { pattern: /\balter\s+user\b/gi, name: 'ALTER USER' },
    { pattern: /\bgrant\s+\w+\s+to\s+public\b/gi, name: 'GRANT TO PUBLIC' },
    { pattern: /\bcreate\s+database\b/gi, name: 'CREATE DATABASE' },
    { pattern: /\bdrop\s+database\b/gi, name: 'DROP DATABASE' },
    { pattern: /\bcreate\s+schema\s+(pg_|information_schema)/gi, name: 'CREATE SYSTEM SCHEMA' },
    { pattern: /\bdrop\s+schema\s+(pg_|information_schema|public)/gi, name: 'DROP CRITICAL SCHEMA' },
  ];

  for (const cmd of dangerous) {
    if (cmd.pattern.test(sql)) {
      return cmd.name;
    }
  }

  return null;
}

/**
 * Check for file operations
 */
function hasFileOperations(sql: string): boolean {
  const patterns = [
    /\bcopy\s+\w+\s+(from|to)\b/gi,
    /\bpg_read_file\s*\(/gi,
    /\bpg_read_binary_file\s*\(/gi,
    /\bpg_ls_dir\s*\(/gi,
    /\bpg_stat_file\s*\(/gi,
    /\blo_import\s*\(/gi,
    /\blo_export\s*\(/gi,
  ];

  return patterns.some(pattern => pattern.test(sql));
}

/**
 * Check for extension operations
 */
function hasExtensionOperations(sql: string): boolean {
  const patterns = [
    /\bcreate\s+extension\b/gi,
    /\bdrop\s+extension\b/gi,
    /\balter\s+extension\b/gi,
  ];

  return patterns.some(pattern => pattern.test(sql));
}

/**
 * Check for role/user management
 */
function hasRoleManagement(sql: string): boolean {
  const patterns = [
    /\b(create|drop|alter)\s+(role|user)\b/gi,
    /\bgrant\b.*\bto\b/gi,
    /\brevoke\b.*\bfrom\b/gi,
    /\bset\s+role\b/gi,
    /\breset\s+role\b/gi,
  ];

  return patterns.some(pattern => pattern.test(sql));
}

/**
 * Check for DROP commands
 */
function hasDropCommand(sql: string): boolean {
  return /\bdrop\s+(table|index|view|sequence|function|procedure|trigger)\b/gi.test(sql);
}

/**
 * Check for TRUNCATE commands
 */
function hasTruncateCommand(sql: string): boolean {
  return /\btruncate\s+table\b/gi.test(sql);
}

/**
 * Check for ALTER commands
 */
function hasAlterCommand(sql: string): boolean {
  return /\balter\s+(table|index|view|sequence|function|procedure)\b/gi.test(sql);
}
