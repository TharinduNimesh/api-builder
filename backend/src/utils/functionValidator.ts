/**
 * Validates and parses PostgreSQL function creation SQL
 * Extracts metadata and ensures security constraints
 */

interface FunctionMetadata {
  name: string;
  schema: string;
  fullName: string;
  parameters: string | null;
  returnType: string | null;
}

export function validateAndParseFunctionSQL(sql: string): FunctionMetadata {
  const trimmed = sql.trim();
  const lowerSql = trimmed.toLowerCase();

  // 1. Check SQL statement type
  if (!/^create(\s+or\s+replace)?\s+function/i.test(trimmed)) {
    throw new Error('Only CREATE FUNCTION or CREATE OR REPLACE FUNCTION statements are allowed');
  }

  // 2. Security: Block dangerous language types
  if (lowerSql.includes('language plpythonu') || 
      lowerSql.includes('language c') || 
      lowerSql.includes('language plperlu')) {
    throw new Error('Functions using plpythonu, plperlu, or C language are not allowed for security reasons');
  }

  // 3. Security: Block COPY commands
  if (lowerSql.includes('copy ') || lowerSql.includes('\\copy')) {
    throw new Error('COPY commands are not allowed in functions');
  }

  // 4. Security: Block access to system tables (Sys* prefix)
  // Check for any reference to tables starting with "sys" (case insensitive)
  const sysTablePattern = /\b(from|join|into|update|delete\s+from)\s+(["`]?sys\w+)/gi;
  const sysMatches = trimmed.match(sysTablePattern);
  if (sysMatches) {
    throw new Error(
      'Access to system tables (Sys* prefix) is not allowed. ' +
      'Functions cannot query, modify, or reference system metadata tables.'
    );
  }

  // Also check for quoted identifiers
  const quotedSysPattern = /["'`](sys\w+)["'`]/gi;
  const quotedMatches = trimmed.match(quotedSysPattern);
  if (quotedMatches) {
    const tableName = quotedMatches[0].replace(/["'`]/g, '');
    if (tableName.toLowerCase().startsWith('sys')) {
      throw new Error(`Access to system table "${tableName}" is not allowed`);
    }
  }

  // 4.1. Security: Block access to sensitive App* authentication tables
  const appAuthTablePattern = /\b(from|join|into|update|delete\s+from|insert\s+into)\s+(["`]?(appuserauth|apprefreshtoken))/gi;
  const appAuthMatches = trimmed.match(appAuthTablePattern);
  if (appAuthMatches) {
    throw new Error(
      'Access to authentication tables (AppUserAuth, AppRefreshToken) is not allowed for security reasons. ' +
      'Functions cannot query, modify, or reference sensitive authentication tables.'
    );
  }

  // Also check for quoted identifiers for App auth tables
  const quotedAppAuthPattern = /["'`](appuserauth|apprefreshtoken|AppUserAuth|AppRefreshToken)["'`]/gi;
  const quotedAppAuthMatches = trimmed.match(quotedAppAuthPattern);
  if (quotedAppAuthMatches) {
    const tableName = quotedAppAuthMatches[0].replace(/["'`]/g, '');
    const lowerTableName = tableName.toLowerCase();
    if (lowerTableName === 'appuserauth' || lowerTableName === 'apprefreshtoken') {
      throw new Error(`Access to authentication table "${tableName}" is not allowed for security reasons`);
    }
  }

  // 5. Extract function name and schema
  const functionNameMatch = trimmed.match(
    /create(?:\s+or\s+replace)?\s+function\s+([\w"]+(?:\.[\w"]+)?)\s*\(/i
  );
  if (!functionNameMatch) {
    throw new Error('Unable to parse function name from SQL statement');
  }

  let identifier = functionNameMatch[1].replace(/"/g, '');
  const parts = identifier.split('.').map((p) => p.trim());
  let schema = 'public';
  let name = parts[parts.length - 1];

  if (parts.length === 2) {
    schema = parts[0];
    if (schema.toLowerCase() !== 'public') {
      throw new Error('Only functions in the public schema are allowed');
    }
  }

  // 6. Check for system-reserved names
  if (/^(pg_|sys)/i.test(name)) {
    throw new Error('Function names starting with "pg_" or "sys" are reserved for system use');
  }

  const fullName = `${schema}.${name}`;

  // 7. Extract parameters
  // Match everything between the function name opening paren and the closing paren before RETURNS
  const paramsMatch = trimmed.match(
    /function\s+[\w".]+ \s*\((.*?)\)\s*returns/is
  );
  
  let parameters: string | null = null;
  if (paramsMatch && paramsMatch[1]) {
    parameters = paramsMatch[1].trim();
    // Clean up whitespace
    parameters = parameters.replace(/\s+/g, ' ');
    if (parameters === '') parameters = null;
  }

  // 8. Extract return type
  // Match RETURNS followed by the type declaration (before AS or LANGUAGE)
  const returnsMatch = trimmed.match(
    /returns\s+(.*?)(?:\s+as|\s+language|\s+stable|\s+immutable|\s+volatile|\$)/is
  );
  
  let returnType: string | null = null;
  if (returnsMatch && returnsMatch[1]) {
    returnType = returnsMatch[1].trim();
    // Clean up whitespace and normalize
    returnType = returnType.replace(/\s+/g, ' ');
    // Handle TABLE(...) return types
    if (returnType.toLowerCase().startsWith('table')) {
      const tableMatch = returnType.match(/table\s*\((.*?)\)/is);
      if (tableMatch) {
        returnType = `TABLE(${tableMatch[1].replace(/\s+/g, ' ')})`;
      }
    }
  }

  return {
    name,
    schema,
    fullName,
    parameters,
    returnType,
  };
}

/**
 * Additional validation for potentially dangerous operations
 */
export function validateFunctionSecurity(sql: string): void {
  const lowerSql = sql.toLowerCase();

  // Check for schema manipulation
  if (lowerSql.includes('create schema') || 
      lowerSql.includes('drop schema') ||
      lowerSql.includes('alter schema')) {
    throw new Error('Schema manipulation commands are not allowed in functions');
  }

  // Check for user/role manipulation
  if (lowerSql.includes('create user') || 
      lowerSql.includes('create role') ||
      lowerSql.includes('grant ') ||
      lowerSql.includes('revoke ')) {
    throw new Error('User and permission management commands are not allowed in functions');
  }

  // Check for dangerous PostgreSQL extensions
  if (lowerSql.includes('create extension')) {
    throw new Error('Creating extensions is not allowed in functions');
  }

  // Check for file system operations
  if (lowerSql.includes('pg_read_file') || 
      lowerSql.includes('pg_ls_dir') ||
      lowerSql.includes('pg_stat_file')) {
    throw new Error('File system access functions are not allowed');
  }

  // Check for administrative functions
  if (lowerSql.includes('pg_terminate_backend') || 
      lowerSql.includes('pg_cancel_backend') ||
      lowerSql.includes('pg_reload_conf')) {
    throw new Error('Administrative functions are not allowed');
  }
}
