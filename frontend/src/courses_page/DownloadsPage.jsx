import React, { useState, useEffect } from 'react';

// Material UI Core Layout Components
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';

// Material UI Icons
import LaunchIcon from '@mui/icons-material/Launch';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';

const DownloadsPage = () => {
  const [downloadHistory, setDownloadHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const backendUrl =
    import.meta.env.VITE_API_URL;

  /**
   * UUID SAFE VALIDATION
   */
  const isValidUserIdentity = (id) => {
    if (!id) return false;

    const clean = String(id).trim();

    return clean.length > 0;
  };

  /**
   * FETCH USER DOWNLOAD HISTORY
   */
 useEffect(() => {
  const fetchDownloads = async () => {
    try {
      const currentUserId = localStorage.getItem('userId');

      if (!isValidUserIdentity(currentUserId)) {
        console.warn('Invalid session user ID.');
        setLoading(false);
        return;
      }

      const response = await fetch(
        `${backendUrl}/api/notes/download/user/${currentUserId}`
      );

      const data = await response.json();

      console.log("DOWNLOAD API RESPONSE:", data);

      if (response.ok) {
        setDownloadHistory(data.downloads || []);
      } else {
        console.error(data.error || 'Failed loading downloads');
      }

    } catch (error) {
      console.error('Download fetch failure:', error);
    } finally {
      setLoading(false);
    }
  };

  fetchDownloads();
}, [backendUrl]);

  /**
   * OPEN FILE
   */
  const handleOpenFile = (fileUrl, title) => {
    if (!fileUrl || fileUrl === '#') {
      alert(`"${title}" file path is unavailable.`);
      return;
    }
window.open(
  `${backendUrl}${fileUrl}`,
  '_blank',
  'noopener,noreferrer'
);
    
  };

  return (
    <Box>
      {/* HEADER */}
      <Box sx={{ marginBottom: '2rem' }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: '700',
            color: '#1e293b',
            marginBottom: '0.5rem'
          }}
        >
          Your Downloads Hub
        </Typography>

        <Typography sx={{ color: '#64748b' }}>
          Access and review all educational notes and
          document assets downloaded to your profile.
        </Typography>
      </Box>

      {/* LOADING */}
      {loading ? (
        <Paper
          elevation={0}
          sx={{
            padding: '3rem',
            textAlign: 'center',
            border: '1px solid #e2e8f0',
            borderRadius: '12px'
          }}
        >
          <CircularProgress />
        </Paper>
      ) : downloadHistory.length === 0 ? (
        /* EMPTY */
        <Paper
          elevation={0}
          sx={{
            padding: '3rem',
            textAlign: 'center',
            border: '1px solid #e2e8f0',
            borderRadius: '12px'
          }}
        >
          <CloudDownloadIcon
            sx={{
              fontSize: '3rem',
              color: '#cbd5e1',
              marginBottom: '1rem'
            }}
          />

          <Typography
            sx={{
              color: '#64748b',
              fontWeight: '500'
            }}
          >
            No active file download logs recorded for
            this account.
          </Typography>
        </Paper>
      ) : (
        /* TABLE */
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{
            border: '1px solid #e2e8f0',
            borderRadius: '12px'
          }}
        >
          <Table aria-label="downloads history">
            <TableHead sx={{ background: '#f8fafc' }}>
              <TableRow>
                <TableCell
                  sx={{
                    fontWeight: '700',
                    color: '#475569'
                  }}
                >
                  Material Title
                </TableCell>

                <TableCell
                  sx={{
                    fontWeight: '700',
                    color: '#475569'
                  }}
                >
                  File Format
                </TableCell>

                <TableCell
                  sx={{
                    fontWeight: '700',
                    color: '#475569'
                  }}
                >
                  Downloaded At
                </TableCell>

                <TableCell
                  align="right"
                  sx={{
                    fontWeight: '700',
                    color: '#475569'
                  }}
                >
                  Action
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {downloadHistory.map((row) => (
                <TableRow
                  key={row.id}
                  sx={{
                    '&:last-child td, &:last-child th': {
                      border: 0
                    },
                    '&:hover': {
                      background: '#f8fafc'
                    }
                  }}
                >
                  {/* TITLE */}
                  <TableCell
                    sx={{
                      fontWeight: '600',
                      color: '#1e293b'
                    }}
                  >
                    {row.title}
                  </TableCell>

                  {/* TYPE */}
                  <TableCell sx={{ color: '#64748b' }}>
                    {(row.file_type || 'PDF').toUpperCase()}
                  </TableCell>

                  {/* DATE */}
                  <TableCell sx={{ color: '#64748b' }}>
                    {row.downloaded_at
                      ? new Date(
                          row.downloaded_at
                        ).toLocaleString()
                      : 'N/A'}
                  </TableCell>

                  {/* ACTION */}
                  <TableCell align="right">
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={
                        <LaunchIcon
                          sx={{
                            fontSize:
                              '0.9rem !important'
                          }}
                        />
                      }
                      onClick={() =>
                        handleOpenFile(
                          row.file_url,
                          row.title
                        )
                      }
                      sx={{
                        background: '#3B592D',
                        color: '#ffffff',
                        fontWeight: '600',
                        textTransform: 'none',
                        borderRadius: '6px',
                        padding: '0.4rem 1rem',
                        boxShadow: 'none',
                        '&:hover': {
                          background: '#2c4322',
                          boxShadow: 'none'
                        }
                      }}
                    >
                      Open File
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default DownloadsPage;