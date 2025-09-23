import { toast } from 'sonner';
import type { ApiError } from './api';

export function notifySuccess(msg: string) {
  toast.success(msg);
}

export function notifyError(err: string | ApiError | any) {
  if (!err) return toast.error('Unknown error');
  if (typeof err === 'string') return toast.error(err);
  const message = err?.message || err?.error || 'An error occurred';
  return toast.error(message);
}

export function notifyInfo(msg: string) {
  toast(msg);
}
