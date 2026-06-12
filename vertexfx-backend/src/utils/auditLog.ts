import { prisma } from '../config/database';
import { AuditSeverity } from '@prisma/client';

interface AuditParams {
  actorId: string;
  targetUserId?: string;
  action: string;
  entityType?: string;
  entityId?: string;
  oldValue?: unknown;
  newValue?: unknown;
  ipAddress?: string;
  userAgent?: string;
  module?: string;
  severity?: AuditSeverity;
}

export async function createAuditLog(params: AuditParams): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: params.actorId,
        targetUserId: params.targetUserId,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        oldValue: params.oldValue ? (params.oldValue as object) : undefined,
        newValue: params.newValue ? (params.newValue as object) : undefined,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
        module: params.module,
        severity: params.severity ?? 'info',
      },
    });
  } catch {
    // Audit log failures must never break the main operation
  }
}
