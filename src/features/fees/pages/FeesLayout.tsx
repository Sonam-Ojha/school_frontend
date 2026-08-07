import { BadgePercent, Layers, Receipt, TrendingDown, Wallet } from 'lucide-react';
import { Outlet } from 'react-router-dom';

import { PATHS } from '@/app/router/paths';
import { PageHeader } from '@/components/layout/PageHeader';
import { NavTabs, type NavTabItem } from '@/components/ui/NavTabs';

const TABS: NavTabItem[] = [
  { label: 'Collect', to: PATHS.feeCollection, icon: Wallet },
  { label: 'Payments', to: PATHS.feePayments, icon: Receipt },
  { label: 'Dues', to: PATHS.feeDues, icon: TrendingDown },
  { label: 'Structures', to: PATHS.feeStructures, icon: Layers },
  { label: 'Fee types', to: PATHS.feeTypes, icon: Layers },
  { label: 'Discounts', to: PATHS.feeDiscounts, icon: BadgePercent },
];

export function FeesLayout() {
  return (
    <>
      <PageHeader
        title="Fees"
        description="Collection, receipts, outstanding dues and the fee catalogue."
        breadcrumbs={[{ label: 'Dashboard', to: PATHS.dashboard }, { label: 'Fees' }]}
      />

      <NavTabs items={TABS} className="mb-6" />

      <Outlet />
    </>
  );
}
