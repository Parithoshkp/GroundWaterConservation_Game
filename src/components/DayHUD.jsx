import React from 'react';
import { Calendar, CloudRain } from 'lucide-react';
import useGameStore from '../store/gameStore';

const DayHUD = () => {
  const { stats } = useGameStore();
  
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const dayName = days[(stats.day - 1) % 7];

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '1.5rem',
      background: 'rgba(0, 0, 0, 0.6)',
      padding: '0.5rem 1rem',
      borderRadius: 'var(--radius-md)',
      border: '1px solid var(--color-border)',
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Calendar size={18} color="var(--color-primary)" />
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Day {stats.day}</span>
          <span style={{ fontWeight: 'bold', color: 'var(--color-text)' }}>{dayName}</span>
        </div>
      </div>

      <div style={{ width: '1px', height: '24px', background: 'var(--color-border)' }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <CloudRain size={18} color="var(--color-accent)" />
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Forecast</span>
          <span style={{ fontWeight: 'bold', color: 'var(--color-text)' }}>{stats.forecast || 'Clear'}</span>
        </div>
      </div>
    </div>
  );
};

export default DayHUD;
