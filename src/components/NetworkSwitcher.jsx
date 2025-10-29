import React, { useState, useEffect } from 'react';
import { Button, Box, Typography, Menu, MenuItem, Alert } from '@mui/material';
import { FaExchangeAlt } from 'react-icons/fa';

const SUPPORTED_NETWORKS = {
  ARBITRUM_SEPOLIA: {
    chainId: '0x66eee', // 421614 in decimal
    chainName: 'Stacks',
    nativeCurrency: {
      name: 'Stacks',
      symbol: 'STX',
      decimals: 18
    },
    rpcUrls: ['https://sepolia-rollup.arbitrum.io/rpc'],
    blockExplorerUrls: ['https://sepolia.arbiscan.io']
  }
};

const NetworkSwitcher = () => {
  const [currentNetwork, setCurrentNetwork] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const checkCurrentNetwork = async () => {
    // Debug log
    console.log('Checking current network...');
    
    if (typeof window === 'undefined') {
      console.log('Window is undefined (SSR)');
      return;
    }

    if (!window.ethereum) {
      console.log('No ethereum provider found');
      setError('Please install MetaMask or another Web3 wallet');
      return;
    }

    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      console.log('Detected Chain ID:', chainId);

      // Convert chainIds to lowercase for comparison
      const arbitrumSepoliaChainId = SUPPORTED_NETWORKS.ARBITRUM_SEPOLIA.chainId.toLowerCase();
      const currentChainId = chainId.toLowerCase();

      if (currentChainId === arbitrumSepoliaChainId) {
        console.log('Setting network to Stacks');
        setCurrentNetwork('ARBITRUM_SEPOLIA');
      } else {
        console.log('Unsupported network detected:', chainId);
        setCurrentNetwork(null);
      }
    } catch (err) {
      console.error('Error checking network:', err);
      setError('Failed to detect network');
    }
  };

  const switchNetwork = async (networkKey) => {
    setLoading(true);
    setError(null);
    handleClose();

    if (!window.ethereum) {
      setError('Please install MetaMask or another Web3 wallet');
      setLoading(false);
      return;
    }

    const network = SUPPORTED_NETWORKS[networkKey];
    console.log('Attempting to switch to network:', networkKey, network);

    try {
      // Try switching to the network
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: network.chainId }],
        });
        console.log('Successfully switched network');
        setCurrentNetwork(networkKey);
      } catch (switchError) {
        console.log('Switch error:', switchError);
        // This error code indicates that the chain has not been added to MetaMask
        if (switchError.code === 4902) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [network],
            });
            console.log('Successfully added and switched to network');
            setCurrentNetwork(networkKey);
          } catch (addError) {
            console.error('Error adding network:', addError);
            setError('Failed to add network to wallet');
          }
        } else {
          console.error('Error switching network:', switchError);
          setError('Failed to switch network');
        }
      }
    } catch (err) {
      console.error('Error:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial check
    checkCurrentNetwork();

    // Listen for network changes
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.on('chainChanged', (chainId) => {
        console.log('Chain changed to:', chainId);
        checkCurrentNetwork();
      });
      
      // Check network when wallet is connected
      window.ethereum.on('connect', () => {
        console.log('Wallet connected');
        checkCurrentNetwork();
      });

      return () => {
        window.ethereum.removeListener('chainChanged', checkCurrentNetwork);
        window.ethereum.removeListener('connect', checkCurrentNetwork);
      };
    }
  }, []);

  // Early return for SSR
  if (typeof window === 'undefined') {
    return null;
  }

  return (
    <Box sx={{ position: 'relative' }}>
      <Button
        onClick={handleClick}
        disabled={loading}
        startIcon={<FaExchangeAlt />}
        sx={{
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          color: 'white',
          borderRadius: 2,
          px: 2,
          py: 1,
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
          }
        }}
      >
        {loading ? 'Switching...' : currentNetwork ? SUPPORTED_NETWORKS[currentNetwork].chainName : 'Switch Network'}
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        sx={{
          '& .MuiPaper-root': {
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 2,
            mt: 1
          }
        }}
      >
        {Object.entries(SUPPORTED_NETWORKS).map(([key, network]) => (
          <MenuItem
            key={key}
            onClick={() => switchNetwork(key)}
            selected={currentNetwork === key}
            sx={{
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
              '&.Mui-selected': {
                backgroundColor: 'rgba(104, 29, 219, 0.2)',
                '&:hover': {
                  backgroundColor: 'rgba(104, 29, 219, 0.3)',
                }
              }
            }}
          >
            <Typography variant="body2">
              {network.chainName}
            </Typography>
          </MenuItem>
        ))}
      </Menu>

      {error && (
        <Alert 
          severity="error" 
          onClose={() => setError(null)}
          sx={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            mt: 1,
            backgroundColor: 'rgba(211, 47, 47, 0.1)',
            color: 'white',
            '& .MuiAlert-icon': {
              color: '#ff4444'
            }
          }}
        >
          {error}
        </Alert>
      )}
    </Box>
  );
};

export default NetworkSwitcher; 