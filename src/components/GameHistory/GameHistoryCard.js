"use client";
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
  Collapse,
  Grid,
  Divider
} from '@mui/material';
import { ExternalLink, Copy, CheckCircle } from 'lucide-react';
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import pythEntropyService from '@/services/PythEntropyService';

const GameHistoryCard = ({ game, gameType }) => {
  const [expanded, setExpanded] = useState(false);
  const [entropyRequestId, setEntropyRequestId] = useState(null);
  const [entropySequenceNumber, setEntropySequenceNumber] = useState(null);
  const [entropyTransactionHash, setEntropyTransactionHash] = useState(null);

  useEffect(() => {
    // Get entropy proof from game record
    const requestId = game?.entropyProof?.requestId || null;
    const sequenceNumber = game?.entropyProof?.sequenceNumber || null;
    const transactionHash = game?.entropyProof?.transactionHash || null;
    setEntropyRequestId(requestId);
    setEntropySequenceNumber(sequenceNumber);
    setEntropyTransactionHash(transactionHash);
  }, [game]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // You can add a toast notification here
  };

  const openTransaction = (txHash, logIndex) => {
    const network = process.env.NEXT_PUBLIC_NETWORK || 'monad-testnet';
    let explorerUrl;
    
    if (network === 'monad-testnet') {
      explorerUrl = `https://testnet.monadexplorer.com/tx/${txHash}#eventlog`;
    } else {
      explorerUrl = `https://testnet.monadexplorer.com/tx/${txHash}#eventlog`;
    }
    
    window.open(explorerUrl, '_blank');
  };

  const openEntropyExplorer = (txHash) => {
    if (txHash) {
      const entropyExplorerUrl = `https://entropy-explorer.pyth.network/?chain=arbitrum-sepolia&search=${txHash}`;
      window.open(entropyExplorerUrl, '_blank');
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const getGameResultColor = (result) => {
    if (result === 'win') return 'success';
    if (result === 'lose') return 'error';
    return 'default';
  };

  const getGameResultText = (result) => {
    if (result === 'win') return '🎉 WIN';
    if (result === 'lose') return '❌ LOSE';
    return '🤝 DRAW';
  };

  const proof = null; // VRF removed in Pyth Entropy mode

  return (
    <Card 
      sx={{ 
        mb: 2, 
        background: 'linear-gradient(135deg, rgba(139, 35, 152, 0.1) 0%, rgba(49, 196, 190, 0.1) 100%)',
        border: '1px solid rgba(139, 35, 152, 0.3)',
        borderRadius: '12px',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 25px rgba(139, 35, 152, 0.3)',
        }
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h6" sx={{ 
              color: 'white',
              fontWeight: 'bold',
              mb: 1
            }}>
              {gameType} Game
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              {formatTimestamp(game.timestamp)}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip 
              label={getGameResultText(game.result)}
              color={getGameResultColor(game.result)}
              variant="outlined"
              sx={{ 
                fontWeight: 'bold',
                borderWidth: '2px'
              }}
            />
            
            <Button
              onClick={() => setExpanded(!expanded)}
              sx={{ 
                color: 'white',
                minWidth: 'auto',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                }
              }}
            >
              {expanded ? <ExpandLess size={20} /> : <ExpandMore size={20} />}
            </Button>
          </Box>
        </Box>

        {/* Game Details */}
        <Box sx={{ mb: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                Bet Amount:
              </Typography>
              <Typography variant="body1" sx={{ color: 'white', fontWeight: 'bold' }}>
                {game.betAmount} MON
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                Payout:
              </Typography>
              <Typography variant="body1" sx={{ color: 'white', fontWeight: 'bold' }}>
                {game.payout || '0'} MON
              </Typography>
            </Grid>
          </Grid>
        </Box>

        {/* Blockchain Logging Status */}
        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          {/* Push Chain Badge */}
          {game?.pushChainTxHash && (
            <Chip
              icon={<CheckCircle size={14} />}
              label="🔗 Push Chain"
              size="small"
              onClick={() => game?.pushChainExplorerUrl && window.open(game.pushChainExplorerUrl, '_blank')}
              sx={{
                bgcolor: 'rgba(139, 35, 152, 0.2)',
                color: '#8B2398',
                border: '1px solid #8B2398',
                cursor: 'pointer',
                '&:hover': { bgcolor: 'rgba(139, 35, 152, 0.3)' }
              }}
            />
          )}
          
          {/* Solana Badge */}
          {game?.solanaTxSignature && (
            <Chip
              icon={<CheckCircle size={14} />}
              label="☀️ Solana"
              size="small"
              onClick={() => game?.solanaExplorerUrl && window.open(game.solanaExplorerUrl, '_blank')}
              sx={{
                bgcolor: 'rgba(20, 216, 84, 0.2)',
                color: '#14D854',
                border: '1px solid #14D854',
                cursor: 'pointer',
                '&:hover': { bgcolor: 'rgba(20, 216, 84, 0.3)' }
              }}
            />
          )}
          
          {/* Linera Badge */}
          {game?.lineraChainId && (
            <Chip
              icon={<CheckCircle size={14} />}
              label="⚡ Linera"
              size="small"
              onClick={() => game?.lineraExplorerUrl && window.open(game.lineraExplorerUrl, '_blank')}
              sx={{
                bgcolor: 'rgba(59, 130, 246, 0.2)',
                color: '#3B82F6',
                border: '1px solid #3B82F6',
                cursor: 'pointer',
                '&:hover': { bgcolor: 'rgba(59, 130, 246, 0.3)' }
              }}
            />
          )}
          
          {/* Pyth Entropy Badge */}
          <Chip
            icon={<CheckCircle size={14} />}
            label="🎲 Pyth Entropy"
            size="small"
            onClick={() => entropyTransactionHash && openEntropyExplorer(entropyTransactionHash)}
            sx={{
              bgcolor: 'rgba(255, 193, 7, 0.2)',
              color: '#FFC107',
              border: '1px solid #FFC107',
              cursor: entropyTransactionHash ? 'pointer' : 'default',
              '&:hover': { bgcolor: 'rgba(255, 193, 7, 0.3)' }
            }}
          />
        </Box>

        {/* Pyth Entropy Info */}
        <Box sx={{ 
          mb: 2, 
          p: 2, 
          bgcolor: 'rgba(255, 193, 7, 0.08)', 
          borderRadius: '8px',
          border: '1px solid rgba(255, 193, 7, 0.3)'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckCircle size={16} color="#FFC107" />
              <Typography variant="subtitle2" sx={{ color: '#FFC107', fontWeight: 'bold' }}>
                🔮 Pyth Entropy
              </Typography>
            </Box>
            {entropyTransactionHash && (
              <Button
                onClick={() => openEntropyExplorer(entropyTransactionHash)}
                size="small"
                startIcon={<ExternalLink size={14} />}
                sx={{
                  color: '#FFC107',
                  fontSize: '0.75rem',
                  minWidth: 'auto',
                  px: 1,
                  py: 0.5,
                  '&:hover': {
                    backgroundColor: 'rgba(255, 193, 7, 0.1)',
                    textDecoration: 'underline',
                  }
                }}
              >
                Explorer
              </Button>
            )}
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                Sequence #:
              </Typography>
              <Typography variant="body2" sx={{ color: '#FFC107', fontFamily: 'monospace', fontWeight: 'bold' }}>
                {entropySequenceNumber ? `#${entropySequenceNumber}` : 'N/A'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                Links:
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                {game?.entropyProof?.monadExplorerUrl && (
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<ExternalLink size={12} />}
                    onClick={() => window.open(game.entropyProof.monadExplorerUrl, '_blank')}
                    sx={{
                      color: '#8B2398',
                      borderColor: '#8B2398',
                      fontSize: '0.75rem',
                      py: 0.5,
                      px: 1
                    }}
                  >
                    Monad
                  </Button>
                )}
                {entropyTransactionHash && (
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<ExternalLink size={12} />}
                    onClick={() => openEntropyExplorer(entropyTransactionHash)}
                    sx={{
                      color: '#681DDB',
                      borderColor: '#681DDB',
                      fontSize: '0.75rem',
                      py: 0.5,
                      px: 1
                    }}
                  >
                    Entropy
                  </Button>
                )}
              </Box>
            </Grid>
            {entropyTransactionHash && (
              <Grid item xs={12}>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  Transaction Hash:
                </Typography>
                <Typography variant="body2" sx={{ color: 'white', fontFamily: 'monospace' }}>
                  {`${entropyTransactionHash.slice(0, 10)}...${entropyTransactionHash.slice(-8)}`}
                </Typography>
              </Grid>
            )}
          </Grid>
        </Box>

        {/* Expanded Content */}
        <Collapse in={expanded}>
          <Divider sx={{ my: 2, borderColor: 'rgba(139, 35, 152, 0.3)' }} />
          
          <Box>
            <Typography variant="h6" sx={{ 
              color: '#8B2398', 
              mb: 2,
              fontWeight: 'bold'
            }}>
              Game Details
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  Game ID:
                </Typography>
                <Typography variant="body2" sx={{ color: 'white', fontFamily: 'monospace' }}>
                  {game.id || 'N/A'}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  Player Address:
                </Typography>
                <Typography variant="body2" sx={{ color: 'white', fontFamily: 'monospace' }}>
                  {game.playerAddress ? 
                    `${game.playerAddress.slice(0, 8)}...${game.playerAddress.slice(-6)}` : 
                    'N/A'
                  }
                </Typography>
              </Grid>
              
              {/* Blockchain Transaction Details */}
              {(game?.pushChainTxHash || game?.solanaTxSignature || game?.lineraChainId) && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>
                      Blockchain Transactions:
                    </Typography>
                  </Grid>
                  
                  {game?.pushChainTxHash && (
                    <Grid item xs={12} sm={4}>
                      <Typography variant="body2" sx={{ color: '#8B2398', fontWeight: 'bold' }}>
                        🔗 Push Chain:
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'white', fontFamily: 'monospace', fontSize: '0.75rem' }}>
                        {`${game.pushChainTxHash.slice(0, 8)}...${game.pushChainTxHash.slice(-6)}`}
                      </Typography>
                    </Grid>
                  )}
                  
                  {game?.solanaTxSignature && (
                    <Grid item xs={12} sm={4}>
                      <Typography variant="body2" sx={{ color: '#14D854', fontWeight: 'bold' }}>
                        ☀️ Solana:
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'white', fontFamily: 'monospace', fontSize: '0.75rem' }}>
                        {`${game.solanaTxSignature.slice(0, 8)}...${game.solanaTxSignature.slice(-6)}`}
                      </Typography>
                    </Grid>
                  )}
                  
                  {game?.lineraChainId && (
                    <Grid item xs={12} sm={4}>
                      <Typography variant="body2" sx={{ color: '#3B82F6', fontWeight: 'bold' }}>
                        ⚡ Linera:
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'white', fontFamily: 'monospace', fontSize: '0.75rem' }}>
                        Chain: {game.lineraChainId.slice(0, 8)}...
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'white', fontFamily: 'monospace', fontSize: '0.75rem' }}>
                        Block: #{game.lineraBlockHeight}
                      </Typography>
                    </Grid>
                  )}
                </>
              )}

              {game.gameData && (
                <Grid item xs={12}>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    Game Data:
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'white', fontFamily: 'monospace' }}>
                    {JSON.stringify(game.gameData, null, 2)}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
};

export default GameHistoryCard;