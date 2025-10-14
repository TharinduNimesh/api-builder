export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export interface ParamDef {
  name: string;
  in: 'path' | 'query' | 'body';
  type: 'string' | 'number' | 'boolean';
  required: boolean;
}

export interface EndpointFormData {
  method: HttpMethod;
  path: string;
  description: string;
  sql: string;
  params: ParamDef[];
  isProtected: boolean;
  allowedRoles: string[];
}

export interface WizardStep {
  num: number;
  label: string;
  icon: any;
}
