import { http } from '@/lib/axios';
import { downloadFile, timestampedFilename } from '@/lib/download';
import type { ApiResource } from '@/types/api';

import type { AttendanceSheetInput } from '../schemas';
import type { AttendanceSheet, AttendanceType, MonthlyReport } from '../types';

export interface SheetQuery {
  type: AttendanceType;
  date: string;
  /** Student sheets are scoped to a class; employee sheets are not. */
  classId?: number | null;
  sectionId?: number | null;
}

export interface MonthlyQuery {
  type: AttendanceType;
  year: number;
  month: number;
  classId?: number | null;
  sectionId?: number | null;
}

export const attendanceService = {
  /**
   * The sheet for one day.
   *
   * Returns every person in scope — already-marked and not — so the screen can
   * distinguish "absent" from "nobody has marked this yet", which a sparse
   * list of records could not.
   */
  async sheet(query: SheetQuery, signal?: AbortSignal): Promise<AttendanceSheet> {
    const { data } = await http.get<ApiResource<AttendanceSheet>>('/attendance/sheet', {
      params: {
        type: query.type,
        date: query.date,
        ...(query.classId ? { class_id: query.classId } : {}),
        ...(query.sectionId ? { section_id: query.sectionId } : {}),
      },
      signal,
    });
    return data.data;
  },

  /** Submits only the rows that changed. */
  async save(input: AttendanceSheetInput): Promise<AttendanceSheet> {
    const { data } = await http.post<ApiResource<AttendanceSheet>>('/attendance/sheet', {
      date: input.date,
      type: input.type,
      class_id: input.class_id,
      section_id: input.section_id,
      entries: input.entries.map((entry) => ({
        person_id: entry.person_id,
        status: entry.status,
        remarks: entry.remarks.trim() || null,
      })),
    });
    return data.data;
  },

  async monthlyReport(query: MonthlyQuery, signal?: AbortSignal): Promise<MonthlyReport> {
    const { data } = await http.get<ApiResource<MonthlyReport>>('/attendance/reports/monthly', {
      params: {
        type: query.type,
        year: query.year,
        month: query.month,
        ...(query.classId ? { class_id: query.classId } : {}),
        ...(query.sectionId ? { section_id: query.sectionId } : {}),
      },
      signal,
    });
    return data.data;
  },

  /** Exports the report currently on screen, filters and all. */
  async exportMonthly(query: MonthlyQuery, format: 'pdf' | 'excel'): Promise<void> {
    const extension = format === 'excel' ? 'xlsx' : 'pdf';
    const stamp = `${query.year}-${String(query.month).padStart(2, '0')}`;

    await downloadFile(
      '/attendance/reports/monthly/export',
      timestampedFilename(`attendance-${query.type}-${stamp}`, extension),
      {
        params: {
          type: query.type,
          year: query.year,
          month: query.month,
          format,
          ...(query.classId ? { class_id: query.classId } : {}),
          ...(query.sectionId ? { section_id: query.sectionId } : {}),
        },
      },
    );
  },
};
