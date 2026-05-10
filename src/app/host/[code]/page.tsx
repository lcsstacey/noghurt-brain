import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ code: string }>;
};

/**
 * Legacy /host/[code] redirects to the unified /play/[code]. Both host and
 * players use the same route now; the host's admin privileges are exposed
 * via a floating <HostAdminBar /> mounted by <UnifiedView />.
 */
export default async function HostPage({ params }: PageProps) {
  const { code } = await params;
  redirect(`/play/${code.toUpperCase()}`);
}
