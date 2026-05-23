import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Rating,
  Chip,
  Avatar,
  Divider
} from '@mui/material';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

// Icons
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import ThumbUpAltRoundedIcon from '@mui/icons-material/ThumbUpAltRounded';
import ThumbDownAltRoundedIcon from '@mui/icons-material/ThumbDownAltRounded';
import RateReviewRoundedIcon from '@mui/icons-material/RateReviewRounded';

export default function LearnerSatisfaction() {
  const [metrics, setMetrics] = useState({
    avgRating: 0,
    positiveFeedback: "0%",
    negativeFeedback: "0%",
    totalReviews: 0
  });

  const [feedbacks, setFeedbacks] = useState([]);
  const [trendData, setTrendData] = useState([]);

  const backendUrl =
    import.meta.env.VITE_API_URL ||
    'http://localhost:3000';

  useEffect(() => {
    const fetchFeedbackAnalytics = async () => {
      try {
        const response = await fetch(
          `${backendUrl}/api/feedback/all`
        );
        const data = await response.json();

        if (response.ok && data.success) {
          setMetrics(data.metrics);
          setFeedbacks(data.feedbacks);
          setTrendData(data.trendData);
        } else {
          console.error(data.message);
        }
      } catch (error) {
        console.error(
          'Feedback Analytics Fetch Error:',
          error
        );
      }
    };

    fetchFeedbackAnalytics();
  }, []);

  return (
    <Box>
      {/* HEADER TITLE */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: '800', color: '#1e293b', mb: 0.5 }}>
          Learner Satisfaction
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748b' }}>
          Monitor learner feedback and satisfaction metrics
        </Typography>
      </Box>

      {/* KPI SUMMARY CARDS */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Card 1: Avg Rating */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#eab308' }}>
              <StarRoundedIcon fontSize="small" />
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: '600' }}>Avg. Rating</Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: '800', color: '#0f172a' }}>
              {metrics.avgRating} <Box component="span" sx={{ fontSize: '1.1rem', color: '#94a3b8', fontWeight: '500' }}>/ 5.0</Box>
            </Typography>
          </Paper>
        </Grid>

        {/* Card 2: Positive Feedback */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#16a34a' }}>
              <ThumbUpAltRoundedIcon fontSize="small" />
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: '600' }}>Positive Feedback</Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: '800', color: '#0f172a' }}>{metrics.positiveFeedback}</Typography>
          </Paper>
        </Grid>

        {/* Card 3: Negative Feedback */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#dc2626' }}>
              <ThumbDownAltRoundedIcon fontSize="small" />
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: '600' }}>Negative Feedback</Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: '800', color: '#0f172a' }}>{metrics.negativeFeedback}</Typography>
          </Paper>
        </Grid>

        {/* Card 4: Total Reviews */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#2563eb' }}>
              <RateReviewRoundedIcon fontSize="small" />
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: '600' }}>Total Reviews</Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: '800', color: '#0f172a' }}>{metrics.totalReviews}</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* CHARTS GRAPH SECTION */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Trend Line Graph */}
        <Grid item xs={12}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: '12px', border: '1px solid #e2e8f0', minHeight: '340px' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: '700', color: '#1e293b', mb: 2 }}>
              Satisfaction Trend
            </Typography>
            
            <Box sx={{ width: '100%', height: '250px', pt: 2 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 5]} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="rating"
                    stroke="#10b981"
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* RECENT FEEDBACK TRANSACTION LOG LIST */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          overflow: 'hidden'
        }}
      >
        {/* HEADER */}
        <Box sx={{ p: 2.5, bgcolor: '#ffffff' }}>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: '700',
              color: '#1e293b'
            }}
          >
            Recent Feedback
          </Typography>
        </Box>

        <Divider />

        {/* FEEDBACK LIST */}
        <Box>
          {feedbacks.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography sx={{ color: '#94a3b8' }}>
                No feedback available
              </Typography>
            </Box>
          ) : (
            feedbacks.map((item, index) => (
              <Box
                key={item.id}
                sx={{
                  p: 3,
                  bgcolor: '#ffffff',
                  borderBottom:
                    index !== feedbacks.length - 1
                      ? '1px solid #f1f5f9'
                      : 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.5
                }}
              >
                {/* TOP SECTION */}
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start'
                  }}
                >
                  {/* LEFT */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography
                        sx={{
                          fontWeight: '700',
                          color: '#0f172a',
                          fontSize: '0.95rem'
                        }}
                      >
                        {item.name}
                      </Typography>

                      <Chip
                        label={item.sentiment}
                        size="small"
                        sx={{
                          fontSize: '0.7rem',
                          height: '18px',
                          fontWeight: '700',
                          textTransform: 'uppercase',
                          borderRadius: '4px',
                          bgcolor:
                            item.sentiment === 'positive'
                              ? '#dcfce7'
                              : item.sentiment === 'negative'
                              ? '#fee2e2'
                              : '#f1f5f9',
                          color:
                            item.sentiment === 'positive'
                              ? '#15803d'
                              : item.sentiment === 'negative'
                              ? '#b91c1c'
                              : '#475569'
                        }}
                      />
                    </Box>

                    {/* COURSE TITLE */}
                    <Typography variant="body2" sx={{ color: '#64748b', fontWeight: '500' }}>
                      {item.course_title}
                    </Typography>
                  </Box>

                  {/* STAR RATING */}
                  <Rating
                    value={Number(item.rating)}
                    readOnly
                    size="small"
                    emptyIcon={
                      <StarRoundedIcon
                        style={{ opacity: 0.2 }}
                        fontSize="inherit"
                      />
                    }
                    icon={
                      <StarRoundedIcon
                        style={{ color: '#f59e0b' }}
                        fontSize="inherit"
                      />
                    }
                  />
                </Box>

                {/* FEEDBACK COMMENT */}
                <Typography variant="body2" sx={{ color: '#334155', lineHeight: 1.6 }}>
                  {item.feedback_text}
                </Typography>

                {/* DATE */}
                <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block' }}>
                  {new Date(item.created_at).toLocaleString()}
                </Typography>
              </Box>
            ))
          )}
        </Box>
      </Paper>
    </Box>
  );
}