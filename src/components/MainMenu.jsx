import React, { useState, useEffect } from 'react';
import { Play, LogIn, User } from 'lucide-react';
import { signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '../firebaseConfig';
import gameBackground from '../assets/game_background.jpg';

const MainMenu = ({ onPlay }) => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!auth) return; // Skip if auth is not initialized

    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    if (!auth) {
      setError("Authentication service is not configured.");
      return;
    }
    try {
      setError(null);
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error("Login failed:", err);
      setError("Login failed. Please check your configuration.");
    }
  };

  const handleLogout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      backgroundImage: `url(${gameBackground})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start', // Changed from center to move content up
      paddingTop: '15vh', // Add top padding to position it nicely
      alignItems: 'center',
      position: 'relative'
    }}>
      {/* Overlay */}


      {/* Content */}
      <div style={{
        zIndex: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem', // Reduced from 2rem
        maxWidth: '500px',
        width: '90%'
      }}>
        <h1 style={{ 
          fontSize: '3.5rem', 
          color: 'var(--color-primary)', 
          textShadow: '0 0 20px rgba(0, 255, 255, 0.5)',
          textAlign: 'center',
          margin: 0
        }}>
          Groundwater Tycoon
        </h1>
        
        <p style={{ 
          color: '#ffffff', // Changed to white for better readability
          fontSize: '1.2rem', 
          textAlign: 'center',
          textShadow: '0 2px 4px rgba(0, 0, 0, 0.9)', // Stronger shadow
          margin: 0 // Ensure no extra margin
        }}>
          Manage resources, fight pollution, and save the aquifer.
        </p>

        {user ? (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1rem', 
            background: 'rgba(0, 0, 0, 0.6)', 
            padding: '0.75rem 1rem', 
            borderRadius: 'var(--radius-md)',
            width: '100%',
            marginTop: '1rem',
            justifyContent: 'space-between'
          }}>
            <div style={{ color: 'white', fontSize: '1rem' }}>{user.email}</div>
            <button 
              onClick={handleLogout}
              style={{
                background: 'transparent',
                border: '1px solid var(--color-accent)',
                color: 'var(--color-accent)',
                padding: '0.25rem 0.5rem',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                fontSize: '0.75rem'
              }}
            >
              Logout
            </button>
          </div>
        ) : (
          <button
            onClick={handleLogin}
            style={{
              background: 'white',
              color: '#333',
              border: 'none',
              padding: '0.75rem 1.5rem', // Reduced padding
              borderRadius: 'var(--radius-md)',
              fontSize: '1rem', // Reduced font size
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              width: 'auto', // Auto width instead of 100%
              minWidth: '200px',
              justifyContent: 'center',
              transition: 'transform 0.2s ease',
              marginTop: '1rem'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <LogIn size={20} />
            Sign in with Google
          </button>
        )}

        {error && (
          <div style={{ color: 'var(--color-accent)', fontSize: '0.9rem', textAlign: 'center', textShadow: '0 1px 2px black' }}>
            {error}
          </div>
        )}

        <button
          onClick={onPlay}
          style={{
            background: 'var(--color-primary)',
            color: 'black',
            border: 'none',
            padding: '1rem 3rem', // Reduced padding
            borderRadius: 'var(--radius-md)',
            fontSize: '1.25rem', // Reduced font size
            fontWeight: 'bold',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            boxShadow: '0 0 20px rgba(0, 255, 255, 0.4)',
            transition: 'all 0.2s ease',
            width: 'auto', // Auto width
            minWidth: '250px',
            justifyContent: 'center',
            marginTop: '0.5rem'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = '0 0 30px rgba(0, 255, 255, 0.6)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 255, 255, 0.4)';
          }}
        >
          <Play size={24} fill="black" />
          PLAY GAME
        </button>
      </div>
    </div>
  );
};

export default MainMenu;
