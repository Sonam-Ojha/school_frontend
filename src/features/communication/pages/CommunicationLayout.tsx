import { MessageSquare, Pin, Radio, StickyNote } from 'lucide-react';
import { Outlet } from 'react-router-dom';

import { PATHS } from '@/app/router/paths';
import { PageHeader } from '@/components/layout/PageHeader';
import { NavTabs, type NavTabItem } from '@/components/ui/NavTabs';

import { COMMUNICATION_PERMISSIONS, NOTICE_PERMISSIONS } from '../constants';

const TABS: NavTabItem[] = [
  { label: 'Messages', to: PATHS.communicationMessages, icon: MessageSquare },
  { label: 'Notice board', to: PATHS.communicationNotices, icon: Pin, permissions: [NOTICE_PERMISSIONS.read] },
  {
    label: 'Templates',
    to: PATHS.communicationTemplates,
    icon: StickyNote,
    permissions: [COMMUNICATION_PERMISSIONS.update],
  },
  {
    label: 'Channels',
    to: PATHS.communicationChannels,
    icon: Radio,
    permissions: [COMMUNICATION_PERMISSIONS.update],
  },
];

/** Shell for the communication area. Each tab is a real route, so it is linkable. */
export function CommunicationLayout() {
  return (
    <>
      <PageHeader
        title="Communication"
        description="SMS, email, WhatsApp and push, the notice board, and the templates behind them."
        breadcrumbs={[{ label: 'Dashboard', to: PATHS.dashboard }, { label: 'Communication' }]}
      />

      <NavTabs items={TABS} className="print-hidden mb-6" />

      <Outlet />
    </>
  );
}
