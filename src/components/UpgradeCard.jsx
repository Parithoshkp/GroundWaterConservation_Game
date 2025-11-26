import React from 'react';
import { ArrowUpCircle } from 'lucide-react';
import useGameStore, { UPGRADE_TYPES } from '../store/gameStore';

const UpgradeCard = ({ upgradeId }) => {
  const { buyUpgrade, resources } = useGameStore();
  const upgrade = UPGRADE_TYPES[upgradeId];
  
  if (!upgrade) return null;

  const canAfford = resources.money >= upgrade.cost;

  return (
    <div className="card" style={{
      background: 'rgba(0, 0, 0, 0.6)',
      padding: '1.5rem',
      borderRadius: 'var(--radius-md)',
      border: '1px solid var(--color-accent)', // Different border for upgrades
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      opacity: canAfford ? 1 : 0.7,
      transition: 'opacity 0.3s ease'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, color: 'var(--color-accent)' }}>{upgrade.name}</h3>
        <ArrowUpCircle size={20} color="var(--color-accent)" />
      </div>
      
      <p style={{ margin: 0, fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
        {upgrade.description}
      </p>

      <button
        onClick={() => buyUpgrade(upgradeId)}
        disabled={!canAfford}
        style={{
          background: canAfford ? 'var(--color-accent)' : 'var(--color-border)',
          color: canAfford ? 'white' : 'var(--color-text-muted)',
          padding: '0.75rem',
          borderRadius: 'var(--radius-sm)',
          cursor: canAfford ? 'pointer' : 'not-allowed',
          fontWeight: 'bold',
          marginTop: 'auto'
        }}
      >
        Upgrade (${upgrade.cost})
      </button>
    </div>
  );
};

export default UpgradeCard;
