import { useAuctionStatus, type AuctionStatus } from '../../hooks/useAuctionStatus.ts';

const STYLES: Record<AuctionStatus, string> = {
  live: 'bg-red-500 text-white',
  'ending-soon': 'bg-orange-500 text-white',
  upcoming: 'bg-white/90 text-blue-700',
  ended: 'bg-black/50 text-white/70',
};

const LABELS: Record<AuctionStatus, string> = {
  live: 'Live',
  'ending-soon': 'Ending Soon',
  upcoming: 'Upcoming',
  ended: 'Ended',
};

interface AuctionStatusBadgeProps {
  auctionStart: string;
  showCountdown?: boolean;
}

export function AuctionStatusBadge({
  auctionStart,
  showCountdown = true,
}: AuctionStatusBadgeProps) {
  const { status, countdown } = useAuctionStatus(auctionStart);
  const isActive = status === 'live' || status === 'ending-soon';

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold ${STYLES[status]}`}
    >
      {isActive && (
        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse flex-shrink-0" />
      )}
      <span>{LABELS[status]}</span>
      {showCountdown && status !== 'ended' && (
        <span className="opacity-75">· {countdown}</span>
      )}
    </span>
  );
}
