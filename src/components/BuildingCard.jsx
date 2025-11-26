import React from 'react';
import { Factory, Droplets, ArrowUpCircle } from 'lucide-react';
import useGameStore from '../store/gameStore';

const BuildingCard = ({ building }) => {
  const { buyBuilding, resources } = useGameStore();
  const canAfford = resources.money >= building.cost;

  return (
    <div className="card" style={{
      background: 'rgba(0, 0, 0, 0.6)',
      padding: '1.5rem',
      borderRadius: 'var(--radius-md)',
      border: '1px solid var(--color-border)',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      opacity: canAfford ? 1 : 0.7,
      transition: 'opacity 0.3s ease'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, color: 'var(--color-primary)' }}>{building.name}</h3>
        <span style={{ 
          background: 'var(--color-bg)', 
          padding: '0.25rem 0.5rem', 
          borderRadius: 'var(--radius-sm)',
          fontSize: 'var(--font-size-sm)',
          color: 'var(--color-text-muted)'
        }}>
          Lvl {building.level}
        </span>
      </div>
      
      <p style={{ margin: 0, fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
        {building.description}
      </p>

      <div style={{ display: 'flex', gap: '1rem', fontSize: 'var(--font-size-sm)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <Droplets size={14} color="var(--color-primary)" />
          <span>+{building.productionRate}/s</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <Factory size={14} color="var(--color-accent)" />
          <span>+{building.pollutionRate}% Pol</span>
        </div>
      </div>

      <button
        onClick={() => buyBuilding(building.id)}
        disabled={!canAfford}
        style={{
          background: canAfford ? 'var(--color-primary-dim)' : 'var(--color-border)',
          color: canAfford ? 'white' : 'var(--color-text-muted)',
          padding: '0.75rem',
          borderRadius: 'var(--radius-sm)',
          cursor: canAfford ? 'pointer' : 'not-allowed',
          fontWeight: 'bold',
          marginTop: 'auto'
        }}
      >
        Buy (${building.cost})
      </button>
    </div>
  );
};

export default BuildingCard;
