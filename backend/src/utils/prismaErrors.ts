import { Prisma } from '@prisma/client';

export function mapPrismaError(err: any) {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // Unique constraint failed
    if (err.code === 'P2002') {
      const target = (err.meta && (err.meta.target || err.meta.field_name)) || [];
      const fields = Array.isArray(target) ? target : [target];
      const details: Record<string,string> = {};
      fields.forEach((f: any) => { details[f] = `${String(f)} already exists`; });
      return { message: 'Unique constraint failed', details };
    }
  }
  return null;
}
