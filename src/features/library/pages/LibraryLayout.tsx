import { BookCopy, IndianRupee, Library, ScrollText, Tags, Undo2 } from 'lucide-react';
import { Outlet } from 'react-router-dom';

import { PATHS } from '@/app/router/paths';
import { PageHeader } from '@/components/layout/PageHeader';
import { NavTabs, type NavTabItem } from '@/components/ui/NavTabs';

import { LIBRARY_PERMISSIONS } from '../constants';

const TABS: NavTabItem[] = [
  { label: 'Catalogue', to: PATHS.libraryCatalogue, icon: Library },
  { label: 'Issue', to: PATHS.libraryIssue, icon: BookCopy, permissions: [LIBRARY_PERMISSIONS.create] },
  { label: 'Return', to: PATHS.libraryReturn, icon: Undo2, permissions: [LIBRARY_PERMISSIONS.update] },
  { label: 'Loans', to: PATHS.libraryLoans, icon: ScrollText },
  { label: 'Fines', to: PATHS.libraryFines, icon: IndianRupee },
  { label: 'Categories', to: PATHS.libraryCategories, icon: Tags, permissions: [LIBRARY_PERMISSIONS.update] },
];

/**
 * Shell for the library.
 *
 * Issue and Return are separate tabs rather than one circulation desk: they
 * start from the same scan but ask different questions of it, and a desk
 * assistant handing books out all morning should not be one mis-click from
 * recording a return.
 */
export function LibraryLayout() {
  return (
    <>
      <PageHeader
        title="Library"
        description="The catalogue, circulation desk, loans and fines."
        breadcrumbs={[{ label: 'Dashboard', to: PATHS.dashboard }, { label: 'Library' }]}
      />

      <NavTabs items={TABS} className="print-hidden mb-6" />

      <Outlet />
    </>
  );
}
