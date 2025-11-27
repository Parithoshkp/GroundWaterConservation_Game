import React, { useEffect, useState } from 'react';
import useGameStore from './store/gameStore';
import { Droplets, Coins, Factory, LayoutDashboard, ShoppingCart, Filter, DollarSign, Sprout, Trash2 } from 'lucide-react';
import BuildingCard from './components/BuildingCard';
import UpgradeCard from './components/UpgradeCard';
import DayHUD from './components/DayHUD';
import gameBackground from './assets/game_background.jpg';
import shopBackground from './assets/shop_bg.png';

import CarSprite from './assets/car.png';
import WaterPumpSprite from './assets/waterpump.png';

import MainMenu from './components/MainMenu';
import { auth } from './firebaseConfig';

function App() {
  const { resources, stats, buildings, upgrades, activeEvent, clearEvent, manualCollect, purifyWater, sellCleanWater, plantTree, organizeCleanup, tick, saveGame, loadGame, resetGame } = useGameStore();
  const [gameState, setGameState] = useState('menu'); // 'menu' | 'playing'
  const [activeTab, setActiveTab] = useState('dashboard');
  const [shopTab, setShopTab] = useState('buildings'); // New state for shop tabs
  const [currentUser, setCurrentUser] = useState(null);

  // Click pop effect handler
  const handleButtonClick = (e, callback) => {
    const button = e.currentTarget;
    button.style.transform = 'scale(0.9)';
    setTimeout(() => {
      button.style.transform = 'scale(1.1)';
      setTimeout(() => {
        button.style.transform = 'scale(1)';
      }, 100);
    }, 100);
    if (callback) callback();
  };

  // Auth state listener
  useEffect(() => {
    if (!auth) return;
    
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      if (user && gameState === 'playing') {
        // Load user's saved game when they log in
        loadGame(user.uid);
      } else if (!user && gameState === 'playing') {
        // Reset to default state when logged out
        resetGame();
      }
    });
    
    return () => unsubscribe();
  }, [gameState]);

  // Auto-save every 30 seconds when playing and logged in
  useEffect(() => {
    if (gameState !== 'playing' || !currentUser) return;
    
    const saveInterval = setInterval(() => {
      saveGame(currentUser.uid);
    }, 30000); // Save every 30 seconds
    
    return () => clearInterval(saveInterval);
  }, [gameState, currentUser, saveGame]);

  // Game Loop
  useEffect(() => {
    if (gameState !== 'playing') return; // Pause game loop when in menu

    const interval = setInterval(() => {
      tick();
    }, 1000); // 1 tick per second

    return () => clearInterval(interval);
  }, [tick, gameState]);

  // Auto-dismiss event notifications after 5 seconds
  useEffect(() => {
    if (activeEvent) {
      const timer = setTimeout(() => {
        clearEvent();
      }, 5000); // 5 seconds
      return () => clearTimeout(timer);
    }
  }, [activeEvent, clearEvent]);

  if (gameState === 'menu') {
    return <MainMenu onPlay={async () => {
      if (currentUser) {
        await loadGame(currentUser.uid);
      } else {
        resetGame();
      }
      setGameState('playing');
    }} />;
  }

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      backgroundImage: `url(${activeTab === 'store' ? shopBackground : gameBackground})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      color: 'white',
      fontFamily: 'var(--font-main)',
      position: 'relative',
      transition: 'background-image 0.3s ease'
    }}>
      <div className="game-container" style={{ 
        width: '100%', 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        // Transparent background
      }}>
      {/* Fixed Header */}
      <header style={{ 
        padding: '1rem', 
        borderBottom: 'none', 
        background: 'transparent',
        zIndex: 10,
        width: '100%'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '2rem' }}>
          {/* Left side - Resources stacked vertically */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '0.75rem',
            background: 'rgba(0, 0, 0, 0.6)',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            minWidth: '200px',
            alignSelf: 'flex-start'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Coins size={20} color="var(--color-success)" />
              <span style={{ fontWeight: 'bold' }}>${resources.money.toFixed(0)}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Droplets size={20} color="var(--color-text-muted)" />
              <span>Polluted: {resources.pollutedWater.toFixed(0)} L</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Droplets size={20} color="var(--color-primary)" />
              <span>Clean: {resources.cleanWater.toFixed(0)} L</span>
            </div>
          </div>

          {/* Center - Pause Button */}
          <button
            onClick={async () => {
              // Save before pausing if logged in
              if (currentUser) {
                await saveGame(currentUser.uid);
                console.log('Game saved before pause');
              }
              setGameState('menu');
            }}
            style={{
              background: 'rgba(0, 0, 0, 0.6)',
              border: '1px solid var(--color-primary)',
              color: 'var(--color-primary)',
              padding: '0.75rem 1.5rem',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              fontSize: '1.125rem',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease',
              alignSelf: 'flex-start'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(0, 255, 255, 0.2)';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(0, 0, 0, 0.6)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            ⏸ PAUSE
          </button>

          {/* Right side - Title and DayHUD */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '1rem' }}>
            <h1 style={{ margin: 0, color: 'var(--color-primary)', fontSize: '1.5rem', textShadow: 'var(--text-shadow-strong)' }}>Groundwater Tycoon</h1>
            <DayHUD />
          </div>
        </div>
      </header>

      {/* Scrollable Content Area */}
      <main style={{ 
        flex: 1, 
        overflowY: 'auto', 
        padding: '2rem',
        // Removed paddingBottom since nav is gone
      }}>
        
        {activeTab === 'dashboard' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', animation: 'slideIn 0.3s ease-out' }}>
            {/* Stats card removed - moved to bottom center */}
          </div>
        )}

        {activeTab === 'store' && (
          <div style={{ animation: 'slideIn 0.3s ease-out', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <button 
              onClick={() => setActiveTab('dashboard')}
              style={{
                marginBottom: '1rem',
                background: 'rgba(0, 0, 0, 0.6)',
                color: 'var(--color-text)',
                border: '1px solid var(--color-primary)',
                padding: '0.75rem 1.5rem',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontWeight: 'bold',
                fontSize: '1.25rem'
              }}
            >
              ← Back to Water Pump
            </button>

            {/* Shop Tabs */}
            <div style={{ 
              display: 'flex', 
              gap: '1rem', 
              marginBottom: '1.5rem',
              borderBottom: '2px solid var(--color-border)'
            }}>
              <button
                onClick={() => setShopTab('buildings')}
                style={{
                  background: 'transparent',
                  color: shopTab === 'buildings' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                  border: 'none',
                  borderBottom: shopTab === 'buildings' ? '2px solid var(--color-primary)' : '2px solid transparent',
                  padding: '0.75rem 1.5rem',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '1.25rem',
                  marginBottom: '-2px',
                  transition: 'all 0.2s ease'
                }}
              >
                Infrastructure
              </button>
              <button
                onClick={() => setShopTab('upgrades')}
                style={{
                  background: 'transparent',
                  color: shopTab === 'upgrades' ? 'var(--color-accent)' : 'var(--color-text-muted)',
                  border: 'none',
                  borderBottom: shopTab === 'upgrades' ? '2px solid var(--color-accent)' : '2px solid transparent',
                  padding: '0.75rem 1.5rem',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '1.25rem',
                  marginBottom: '-2px',
                  transition: 'all 0.2s ease'
                }}
              >
                Research & Upgrades {upgrades.available.length > 0 && `(${upgrades.available.length})`}
              </button>
            </div>

            {/* Tab Content */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {shopTab === 'buildings' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                  {Object.values(buildings).map((building) => (
                    <BuildingCard key={building.id} building={building} />
                  ))}
                </div>
              )}

              {shopTab === 'upgrades' && (
                <div>
                  {upgrades.available.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                      {upgrades.available.map((upgradeId) => (
                        <UpgradeCard key={upgradeId} upgradeId={upgradeId} />
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>No new research available at this time.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Game Over Overlay */}
      {(stats.aquiferLevel <= 0 || stats.pollutionLevel >= 100) && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0, 0, 0, 0.9)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <h1 style={{ color: 'var(--color-accent)', fontSize: '3rem', marginBottom: '1rem' }}>CRITICAL FAILURE</h1>
          <p style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>
            {stats.aquiferLevel <= 0 ? 'The Aquifer has run dry.' : 'Pollution levels are irreversible.'}
          </p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              background: 'var(--color-primary)',
              color: 'black',
              padding: '1rem 3rem',
              fontSize: '1.2rem',
              borderRadius: 'var(--radius-md)',
              fontWeight: 'bold'
            }}
          >
            Restart Operation
          </button>
        </div>
      )}

      {/* Event Modal */}
      {activeEvent && (
        <div style={{
          position: 'fixed',
          top: '6rem', // Changed from 2rem to move below header
          left: '2rem',
          background: 'rgba(0, 0, 0, 0.5)',
          border: '1px solid var(--color-primary)',
          padding: '1.5rem',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-glow)',
          maxWidth: '400px',
          animation: 'slideIn 0.5s ease-out',
          zIndex: 100
        }}>
          <h3 style={{ marginTop: 0, color: 'var(--color-primary)' }}>{activeEvent.title}</h3>
          <p style={{ color: 'var(--color-text)' }}>{activeEvent.description}</p>
          <button 
            onClick={clearEvent}
            style={{
              marginTop: '1rem',
              background: 'var(--color-primary-dim)',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-sm)',
              width: '100%'
            }}
          >
            Dismiss
          </button>
        </div>
      )}
      </div>
      
      {/* Shop Car Button - Only show on dashboard */}
      {activeTab === 'dashboard' && (
        <>
          <img 
            src={CarSprite} 
            alt="Shop" 
            onClick={() => setActiveTab('store')}
            style={{
              position: 'absolute',
              bottom: '20px',
              right: '20px',
              width: '650px',
              cursor: 'pointer',
              zIndex: 100,
              transition: 'transform 0.2s ease',
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          />
          
          {/* Water Pump Button - Collects Groundwater */}
          <img 
            src={WaterPumpSprite} 
            alt="Collect Groundwater" 
            onClick={(e) => handleButtonClick(e, manualCollect)}
            style={{
              position: 'absolute',
              bottom: '25%',
              left: '45%',
              width: '130px',
              cursor: 'pointer',
              zIndex: 100,
              transition: 'transform 0.2s ease',
              filter: stats.aquiferLevel <= 0 ? 'grayscale(100%) opacity(0.5)' : 'none',
            }}
            onMouseOver={(e) => {
              if (stats.aquiferLevel > 0) {
                e.currentTarget.style.transform = 'scale(1.1)';
              }
            }}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            title={stats.aquiferLevel > 0 ? 'Click to collect groundwater' : 'Aquifer depleted'}
          />
          
          {/* Purify and Sell Buttons - Below Water Pump */}
          <div style={{
            position: 'absolute',
            bottom: '15%',
            left: '45%',
            display: 'flex',
            gap: '1rem',
            zIndex: 100
          }}>
            {/* Purify Button */}
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <button 
                onClick={(e) => handleButtonClick(e, purifyWater)}
                disabled={resources.pollutedWater < 1}
                style={{
                  background: resources.pollutedWater >= 1 ? 'var(--color-primary)' : 'rgba(100, 100, 100, 0.5)',
                  color: resources.pollutedWater >= 1 ? 'black' : 'var(--color-text-muted)',
                  padding: '1rem',
                  borderRadius: '50%',
                  width: '60px',
                  height: '60px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: resources.pollutedWater >= 1 ? 'pointer' : 'not-allowed',
                  border: '2px solid ' + (resources.pollutedWater >= 1 ? 'var(--color-primary)' : 'var(--color-border)'),
                  transition: 'all 0.2s ease',
                  boxShadow: resources.pollutedWater >= 1 ? '0 4px 12px rgba(0, 255, 255, 0.3)' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (resources.pollutedWater >= 1) {
                    e.currentTarget.style.transform = 'scale(1.1)';
                    e.currentTarget.nextElementSibling.style.opacity = '1';
                    e.currentTarget.nextElementSibling.style.visibility = 'visible';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.nextElementSibling.style.opacity = '0';
                  e.currentTarget.nextElementSibling.style.visibility = 'hidden';
                }}
              >
                <Filter size={24} />
              </button>
              {/* Tooltip */}
              <div style={{
                position: 'absolute',
                right: '70px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(0, 0, 0, 0.9)',
                color: 'white',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-sm)',
                whiteSpace: 'nowrap',
                fontSize: '1.1rem',
                opacity: '0',
                visibility: 'hidden',
                transition: 'opacity 0.2s ease, visibility 0.2s ease',
                pointerEvents: 'none',
                border: '1px solid var(--color-primary)',
                zIndex: 1000
              }}>
                <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Purify Water</div>
                <div style={{ fontSize: '1rem', color: 'var(--color-text-muted)' }}>Convert 1 Polluted &rarr; 1 Clean</div>
                {/* Arrow */}
                <div style={{
                  position: 'absolute',
                  right: '-6px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '0',
                  height: '0',
                  borderTop: '6px solid transparent',
                  borderBottom: '6px solid transparent',
                  borderLeft: '6px solid rgba(0, 0, 0, 0.9)'
                }}></div>
              </div>
            </div>

            {/* Sell Button */}
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <button 
                onClick={(e) => handleButtonClick(e, sellCleanWater)}
                disabled={resources.cleanWater < 1}
                style={{
                  background: resources.cleanWater >= 1 ? 'var(--color-success)' : 'rgba(100, 100, 100, 0.5)',
                  color: resources.cleanWater >= 1 ? 'black' : 'var(--color-text-muted)',
                  padding: '1rem',
                  borderRadius: '50%',
                  width: '60px',
                  height: '60px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: resources.cleanWater >= 1 ? 'pointer' : 'not-allowed',
                  border: '2px solid ' + (resources.cleanWater >= 1 ? 'var(--color-success)' : 'var(--color-border)'),
                  transition: 'all 0.2s ease',
                  boxShadow: resources.cleanWater >= 1 ? '0 4px 12px rgba(0, 255, 0, 0.3)' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (resources.cleanWater >= 1) {
                    e.currentTarget.style.transform = 'scale(1.1)';
                    e.currentTarget.nextElementSibling.style.opacity = '1';
                    e.currentTarget.nextElementSibling.style.visibility = 'visible';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.nextElementSibling.style.opacity = '0';
                  e.currentTarget.nextElementSibling.style.visibility = 'hidden';
                }}
              >
                <DollarSign size={24} />
              </button>
              {/* Tooltip */}
              <div style={{
                position: 'absolute',
                left: '70px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(0, 0, 0, 0.9)',
                color: 'white',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-sm)',
                whiteSpace: 'nowrap',
                fontSize: '1.1rem',
                opacity: '0',
                visibility: 'hidden',
                transition: 'opacity 0.2s ease, visibility 0.2s ease',
                pointerEvents: 'none',
                border: '1px solid var(--color-success)',
                zIndex: 1000
              }}>
                <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Sell Water</div>
                <div style={{ fontSize: '1rem', color: 'var(--color-text-muted)' }}>Sell 1 Clean Water for $5</div>
                {/* Arrow */}
                <div style={{
                  position: 'absolute',
                  left: '-6px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '0',
                  height: '0',
                  borderTop: '6px solid transparent',
                  borderBottom: '6px solid transparent',
                  borderRight: '6px solid rgba(0, 0, 0, 0.9)'
                }}></div>
              </div>
            </div>
          </div>

          {/* Sustainability Action Buttons - Bottom Left */}
          <div style={{
            position: 'absolute',
            bottom: '20px',
            left: '20px',
            display: 'flex',
            gap: '1rem',
            zIndex: 100
          }}>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <button 
                onClick={(e) => handleButtonClick(e, plantTree)}
                disabled={resources.money < 50}
                style={{
                  background: resources.money >= 50 ? 'var(--color-success)' : 'rgba(100, 100, 100, 0.5)',
                  color: resources.money >= 50 ? 'black' : 'var(--color-text-muted)',
                  padding: '1rem',
                  borderRadius: '50%',
                  width: '60px',
                  height: '60px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: resources.money >= 50 ? 'pointer' : 'not-allowed',
                  border: '2px solid ' + (resources.money >= 50 ? 'var(--color-success)' : 'var(--color-border)'),
                  transition: 'all 0.2s ease',
                  boxShadow: resources.money >= 50 ? '0 4px 12px rgba(0, 255, 0, 0.3)' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (resources.money >= 50) {
                    e.currentTarget.style.transform = 'scale(1.1)';
                    e.currentTarget.nextElementSibling.style.opacity = '1';
                    e.currentTarget.nextElementSibling.style.visibility = 'visible';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.nextElementSibling.style.opacity = '0';
                  e.currentTarget.nextElementSibling.style.visibility = 'hidden';
                }}
              >
                <Sprout size={24} />
              </button>
              {/* Tooltip */}
              <div style={{
                position: 'absolute',
                left: '70px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(0, 0, 0, 0.9)',
                color: 'white',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-sm)',
                whiteSpace: 'nowrap',
                fontSize: '1.1rem',
                opacity: '0',
                visibility: 'hidden',
                transition: 'opacity 0.2s ease, visibility 0.2s ease',
                pointerEvents: 'none',
                border: '1px solid var(--color-success)',
                zIndex: 1000
              }}>
                <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Plant Tree ($50)</div>
                <div style={{ fontSize: '1rem', color: 'var(--color-text-muted)' }}>Reduces pollution by 1%</div>
                {/* Arrow */}
                <div style={{
                  position: 'absolute',
                  left: '-6px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '0',
                  height: '0',
                  borderTop: '6px solid transparent',
                  borderBottom: '6px solid transparent',
                  borderRight: '6px solid rgba(0, 0, 0, 0.9)'
                }}></div>
              </div>
            </div>

            {/* Cleanup Button */}
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <button 
                onClick={(e) => handleButtonClick(e, organizeCleanup)}
                disabled={resources.money < 500}
                style={{
                  background: resources.money >= 500 ? 'var(--color-primary)' : 'rgba(100, 100, 100, 0.5)',
                  color: resources.money >= 500 ? 'black' : 'var(--color-text-muted)',
                  padding: '1rem',
                  borderRadius: '50%',
                  width: '60px',
                  height: '60px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: resources.money >= 500 ? 'pointer' : 'not-allowed',
                  border: '2px solid ' + (resources.money >= 500 ? 'var(--color-primary)' : 'var(--color-border)'),
                  transition: 'all 0.2s ease',
                  boxShadow: resources.money >= 500 ? '0 4px 12px rgba(0, 255, 255, 0.3)' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (resources.money >= 500) {
                    e.currentTarget.style.transform = 'scale(1.1)';
                    e.currentTarget.nextElementSibling.style.opacity = '1';
                    e.currentTarget.nextElementSibling.style.visibility = 'visible';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.nextElementSibling.style.opacity = '0';
                  e.currentTarget.nextElementSibling.style.visibility = 'hidden';
                }}
              >
                <Trash2 size={24} />
              </button>
              {/* Tooltip */}
              <div style={{
                position: 'absolute',
                left: '70px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(0, 0, 0, 0.9)',
                color: 'white',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-sm)',
                whiteSpace: 'nowrap',
                fontSize: '1.1rem',
                opacity: '0',
                visibility: 'hidden',
                transition: 'opacity 0.2s ease, visibility 0.2s ease',
                pointerEvents: 'none',
                border: '1px solid var(--color-primary)',
                zIndex: 1000
              }}>
                <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Organize Cleanup ($500)</div>
                <div style={{ fontSize: '1rem', color: 'var(--color-text-muted)' }}>Reduces pollution by 10%</div>
                {/* Arrow */}
                <div style={{
                  position: 'absolute',
                  left: '-6px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '0',
                  height: '0',
                  borderTop: '6px solid transparent',
                  borderBottom: '6px solid transparent',
                  borderRight: '6px solid rgba(0, 0, 0, 0.9)'
                }}></div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Status Bars - Bottom Center */}
      {activeTab === 'dashboard' && (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '2rem',
          zIndex: 100
        }}>
          {/* Water Level Bar */}
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <div 
              style={{
                width: '200px',
                height: '20px',
                background: '#333',
                borderRadius: '10px',
                overflow: 'hidden',
                border: '2px solid var(--color-primary)',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.nextElementSibling.style.opacity = '1';
                e.currentTarget.nextElementSibling.style.visibility = 'visible';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.nextElementSibling.style.opacity = '0';
                e.currentTarget.nextElementSibling.style.visibility = 'hidden';
              }}
            >
              <div style={{
                width: `${stats.aquiferLevel}%`,
                height: '100%',
                background: 'var(--color-primary)',
                transition: 'width 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{ 
                  fontSize: '0.95rem', 
                  fontWeight: 'bold', 
                  color: 'black',
                  textShadow: '0 0 2px rgba(255,255,255,0.5)'
                }}>{stats.aquiferLevel.toFixed(1)}%</span>
              </div>
            </div>
            {/* Tooltip */}
            <div style={{
              position: 'absolute',
              bottom: '30px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(0, 0, 0, 0.9)',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-sm)',
              whiteSpace: 'nowrap',
              fontSize: '1.05rem',
              opacity: '0',
              visibility: 'hidden',
              transition: 'opacity 0.2s ease, visibility 0.2s ease',
              pointerEvents: 'none',
              border: '1px solid var(--color-primary)',
              zIndex: 1000
            }}>
              <div style={{ fontWeight: 'bold' }}>Water Level</div>
              {/* Arrow */}
              <div style={{
                position: 'absolute',
                bottom: '-6px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '0',
                height: '0',
                borderLeft: '6px solid transparent',
                borderRight: '6px solid transparent',
                borderTop: '6px solid rgba(0, 0, 0, 0.9)'
              }}></div>
            </div>
          </div>

          {/* Pollution Level Bar */}
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <div 
              style={{
                width: '200px',
                height: '20px',
                background: '#333',
                borderRadius: '10px',
                overflow: 'hidden',
                border: '2px solid var(--color-accent)',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.nextElementSibling.style.opacity = '1';
                e.currentTarget.nextElementSibling.style.visibility = 'visible';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.nextElementSibling.style.opacity = '0';
                e.currentTarget.nextElementSibling.style.visibility = 'hidden';
              }}
            >
              <div style={{
                width: `${stats.pollutionLevel}%`,
                height: '100%',
                background: 'var(--color-accent)',
                transition: 'width 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{ 
                  fontSize: '0.95rem', 
                  fontWeight: 'bold', 
                  color: 'black',
                  textShadow: '0 0 2px rgba(255,255,255,0.5)'
                }}>{stats.pollutionLevel.toFixed(1)}%</span>
              </div>
            </div>
            {/* Tooltip */}
            <div style={{
              position: 'absolute',
              bottom: '30px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(0, 0, 0, 0.9)',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-sm)',
              whiteSpace: 'nowrap',
              fontSize: '1.05rem',
              opacity: '0',
              visibility: 'hidden',
              transition: 'opacity 0.2s ease, visibility 0.2s ease',
              pointerEvents: 'none',
              border: '1px solid var(--color-accent)',
              zIndex: 1000
            }}>
              <div style={{ fontWeight: 'bold' }}>Pollution Level</div>
              {/* Arrow */}
              <div style={{
                position: 'absolute',
                bottom: '-6px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '0',
                height: '0',
                borderLeft: '6px solid transparent',
                borderRight: '6px solid transparent',
                borderTop: '6px solid rgba(0, 0, 0, 0.9)'
              }}></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
