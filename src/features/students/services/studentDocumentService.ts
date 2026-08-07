import { createDocumentService } from '@/lib/createDocumentService';

/** Student documents. Composes the shared owner-agnostic document service. */
export const studentDocumentService = createDocumentService('/students');
