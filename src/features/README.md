# Feature modules

One folder per business module. A module owns its types, validation, service, hooks and
screens — and reuses everything in `components/`, `hooks/` and `lib/` rather than
reimplementing it.

## Layout

```
features/students/
├── types.ts                 Student, StudentPayload — mirrors the API Resource
├── schemas.ts               Zod schemas (the single source of client validation)
├── services/
│   └── studentService.ts    createCrudService('/students') + module-specific endpoints
├── hooks/
│   ├── useStudents.ts       list / detail queries
│   └── useStudentMutations.ts  create / update / delete + invalidation
├── components/
│   ├── StudentForm.tsx      shared by create and edit — never duplicated
│   └── StudentColumns.tsx   DataTable column definitions
└── pages/
    ├── StudentListPage.tsx
    └── StudentDetailPage.tsx
```

## Rules

1. **Service** — compose `createCrudService<T, TPayload>('/endpoint')`; add only the
   endpoints that module actually adds. Never write raw `axios` calls.
2. **Query keys** — `const studentKeys = createResourceKeys('students')`. Invalidate
   `studentKeys.lists()` after a write.
3. **Validation** — define it once in `schemas.ts` and derive the payload type with
   `z.infer`. Server 422s go through `applyServerErrors`, not a second set of rules.
4. **Forms** — one `<Form>` for both create and edit, driven by `defaultValues`.
5. **Lists** — `useTableQueryState` + `DataTable` + `TableToolbar`. Do not hand-roll
   pagination, search or sorting.
6. **Access** — wrap actions in `<Can permissions={[...]}>` and pass `permissions` to
   `ProtectedRoute`. Both are advisory; the API enforces.

## Registration

Two files, nothing else:

- `src/app/router/index.tsx` — add lazy route objects to `protectedRoutes`
- `src/app/router/navigation.ts` — add the sidebar entry with its roles/permissions
