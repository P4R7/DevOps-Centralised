import { RotateCcw } from 'lucide-react';
import { useCountdown } from '../hooks/useCountdown';

interface RollbackProdButtonProps {
  deployedAt?: string;
  onRollback: () => void;
}

export function RollbackProdButton({ deployedAt, onRollback }: RollbackProdButtonProps) {
  const { isExpired, formattedTime } = useCountdown(deployedAt, 24);

  return (
    <button
      onClick={(e) => { e.stopPropagation(); onRollback(); }}
      disabled={isExpired}
      className="small outline"
      data-variant="danger"
      title={isExpired ? "Rollback period expired" : "Rollback from Production"}
    >
      <RotateCcw size={14} />
      <span>Rollback {isExpired ? '(Expired)' : `(${formattedTime})`}</span>
    </button>
  );
}

