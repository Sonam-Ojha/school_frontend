import { http } from '@/lib/axios';
import { createCrudService } from '@/lib/createCrudService';
import type { ApiResource, CollectionResponse, ListQueryParams } from '@/types/api';

import { readMarks, type ClassInput, type SectionInput, type SubjectInput } from '../schemas';
import type {
  SchoolClass,
  SchoolClassSummary,
  Section,
  Subject,
  SubjectDetail,
} from '../types';

const classCrud = createCrudService<SchoolClassSummary>('/academics/classes');
const subjectCrud = createCrudService<Subject>('/academics/subjects');

const nullable = (value: string | undefined): string | null => value?.trim() || null;

const toClassPayload = (input: ClassInput) => ({
  name: input.name.trim(),
  level: input.level,
  is_active: input.is_active,
});

/**
 * A disabled component carries no marks, whatever is left in its hidden
 * inputs — otherwise switching practical off would leave stale marks behind
 * and `total_max_marks` would keep counting them.
 */
const toSubjectPayload = (input: SubjectInput) => ({
  name: input.name.trim(),
  code: input.code.trim().toUpperCase(),

  has_theory: input.has_theory,
  theory_max_marks: input.has_theory ? readMarks(input.theory_max_marks) : null,
  theory_pass_marks: input.has_theory ? readMarks(input.theory_pass_marks) : null,

  has_practical: input.has_practical,
  practical_max_marks: input.has_practical ? readMarks(input.practical_max_marks) : null,
  practical_pass_marks: input.has_practical ? readMarks(input.practical_pass_marks) : null,

  credits: input.credits,
  is_elective: input.is_elective,
  is_active: input.is_active,
});

const toSectionPayload = (input: SectionInput) => ({
  name: input.name.trim().toUpperCase(),
  shift: input.shift,
  capacity: input.capacity,
  room: nullable(input.room),
  is_active: input.is_active,
});

/**
 * Class, section and subject I/O.
 *
 * `lookup()` is the unpaginated form other modules read for their selects;
 * `list()` is the paginated form this module's own table uses. Both hit the
 * same endpoint — the API distinguishes them by `per_page=all`.
 */
export const academicsService = {
  // --- lookups, read by students, teachers and later timetables ---

  async classes(signal?: AbortSignal): Promise<SchoolClass[]> {
    const { data } = await http.get<CollectionResponse<SchoolClass>>('/academics/classes', {
      params: { per_page: 'all', with: 'sections' },
      signal,
    });
    return data.data;
  },

  async subjects(signal?: AbortSignal): Promise<Subject[]> {
    const { data } = await http.get<CollectionResponse<Subject>>('/academics/subjects', {
      params: { per_page: 'all' },
      signal,
    });
    return data.data;
  },

  // --- class management ---

  list: classCrud.list,

  async show(id: number | string, signal?: AbortSignal): Promise<SchoolClass> {
    const { data } = await http.get<ApiResource<SchoolClass>>(`/academics/classes/${id}`, {
      params: { with: 'sections' },
      signal,
    });
    return data.data;
  },

  async createClass(input: ClassInput): Promise<SchoolClass> {
    const { data } = await http.post<ApiResource<SchoolClass>>(
      '/academics/classes',
      toClassPayload(input),
    );
    return data.data;
  },

  async updateClass(id: number, input: ClassInput): Promise<SchoolClass> {
    const { data } = await http.put<ApiResource<SchoolClass>>(
      `/academics/classes/${id}`,
      toClassPayload(input),
    );
    return data.data;
  },

  async removeClass(id: number): Promise<void> {
    await http.delete(`/academics/classes/${id}`);
  },

  // --- section management, always nested under a class ---

  async createSection(classId: number, input: SectionInput): Promise<Section> {
    const { data } = await http.post<ApiResource<Section>>(
      `/academics/classes/${classId}/sections`,
      toSectionPayload(input),
    );
    return data.data;
  },

  async updateSection(classId: number, sectionId: number, input: SectionInput): Promise<Section> {
    const { data } = await http.put<ApiResource<Section>>(
      `/academics/classes/${classId}/sections/${sectionId}`,
      toSectionPayload(input),
    );
    return data.data;
  },

  async removeSection(classId: number, sectionId: number): Promise<void> {
    await http.delete(`/academics/classes/${classId}/sections/${sectionId}`);
  },

  // --- subject management ---

  listSubjects: subjectCrud.list,

  async showSubject(id: number | string, signal?: AbortSignal): Promise<SubjectDetail> {
    const { data } = await http.get<ApiResource<SubjectDetail>>(`/academics/subjects/${id}`, {
      params: { with: 'teachers' },
      signal,
    });
    return data.data;
  },

  async createSubject(input: SubjectInput): Promise<SubjectDetail> {
    const { data } = await http.post<ApiResource<SubjectDetail>>(
      '/academics/subjects',
      toSubjectPayload(input),
    );
    return data.data;
  },

  async updateSubject(id: number, input: SubjectInput): Promise<SubjectDetail> {
    const { data } = await http.put<ApiResource<SubjectDetail>>(
      `/academics/subjects/${id}`,
      toSubjectPayload(input),
    );
    return data.data;
  },

  async removeSubject(id: number): Promise<void> {
    await http.delete(`/academics/subjects/${id}`);
  },

  /**
   * Replace the set of teachers qualified to teach this subject.
   *
   * The same pivot the teacher form writes from the other direction — sending
   * the whole set rather than deltas keeps the two views from disagreeing
   * about what a partial update means.
   */
  async assignTeachers(id: number, teacherIds: number[]): Promise<SubjectDetail> {
    const { data } = await http.put<ApiResource<SubjectDetail>>(
      `/academics/subjects/${id}/teachers`,
      { teacher_ids: teacherIds },
    );
    return data.data;
  },
};

export type { ListQueryParams };
