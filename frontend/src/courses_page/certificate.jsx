// src/courses_page/certificate.jsx
import React, { useEffect, useRef } from 'react';
import { jsPDF } from 'jspdf';
import Button from '@mui/material/Button';
import DownloadIcon from '@mui/icons-material/Download';

const Certificate = ({
  studentName,
  subjectName,
  completionDate,
  variantColor,
  courseId,
  downloadModeOnly = false
}) => {
  const canvasRef = useRef(null);

  // Fallback programmatic configuration mapping your reference images
  const theme = {
    purple: {
      primary: '#7c3aed',
      secondary: '#c084fc',
      bgGradient: ['#3b0764', '#1e1b4b']
    },
    blue: {
      primary: '#0284c7',
      secondary: '#38bdf8',
      bgGradient: ['#0c4a6e', '#0f172a']
    }
  };

  const currentTheme = variantColor === 'purple' ? theme.purple : theme.blue;

  const renderCanvasContent = (ctx, canvas) => {
    const w = canvas.width;
    const h = canvas.height;

    // Clear canvas before redrawing
    ctx.clearRect(0, 0, w, h);

    // Background
    ctx.fillStyle = currentTheme.bgGradient[1];
    ctx.fillRect(0, 0, w, h);

    // Border
    ctx.strokeStyle = currentTheme.secondary;
    ctx.lineWidth = 4;
    ctx.strokeRect(40, 40, w - 80, h - 80);

    // Corner shape
    ctx.fillStyle = currentTheme.primary;
    ctx.beginPath();
    ctx.moveTo(0, h);
    ctx.lineTo(180, h);
    ctx.lineTo(0, h - 180);
    ctx.fill();

    // Main certificate body
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(60, 80, w - 120, h - 160);

    // Right ribbon
    ctx.fillStyle = currentTheme.primary;
    ctx.fillRect(w - 90, 80, 25, h - 160);

    // Dynamic Brand Render (Text Logo styling matched to image specs)
    const brandX = 110;
    const brandY = 160;
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 38px Georgia, serif';
    ctx.fillText('Eduvanta', brandX, brandY);

    // FIX: Dynamic tracking computes text length to keep the dot perfectly positioned to the right
    const brandTextMetrics = ctx.measureText('Eduvanta');
    const dotSpacing = 4; // Clean pixel spacing after the 'a'
    const dotX = brandX + brandTextMetrics.width + dotSpacing;
    
    // Exact positioning of the brand's lime green accent dot trailing the text
    ctx.fillStyle = '#58a533';
    ctx.fillRect(dotX, 148, 10, 10);

    // Heading
    ctx.fillStyle = currentTheme.primary;
    ctx.font = '600 24px "Poppins", sans-serif';
    ctx.fillText('Certificate of Completion', 110, 240);

    // Subtitle
    ctx.fillStyle = '#64748b';
    ctx.font = '400 16px "Poppins", sans-serif';
    ctx.fillText('This is proudly presented to', 110, 275);

    // Student name
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 38px "Poppins", sans-serif';
    ctx.fillText(studentName || 'Student', 110, 335);

    // Description
    ctx.fillStyle = '#334155';
    ctx.font = '500 16px "Poppins", sans-serif';
    const message = 'For successfully mastering and fulfilling all technical milestones allocated under';
    ctx.fillText(message, 110, 390);

    // Course title
    ctx.fillStyle = currentTheme.primary;
    ctx.font = 'bold 20px "Poppins", sans-serif';
    ctx.fillText(`${subjectName || 'Course'} Curricular Tracking.`, 110, 425);

    // Footer Base Height Rule Coordinate
    const footerLineY = h - 165;

    // Footer lines
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(110, footerLineY, 220, 1.5);      // Date side line
    ctx.fillRect(w - 360, footerLineY, 220, 1.5);  // Registrar side line

    // Footer text formatting
    ctx.fillStyle = '#64748b';
    ctx.font = '500 14px "Poppins", sans-serif';

    // FIX: Date split setup -> 2026-05-19 moves above, Label moves under
    const formattedDate = completionDate ? completionDate : new Date().toLocaleDateString('en-CA');
    ctx.fillText(formattedDate, 110, footerLineY - 12);
    ctx.fillText('Date of Issuance', 110, footerLineY + 20);

    // Registrar Title text sits neatly below its respective baseline line
    ctx.fillText('Authorized Registrar', w - 310, footerLineY + 20);

    // Academic Sign-off Team text positioned gracefully above the line
    ctx.fillStyle = '#0f172a';
    ctx.font = 'italic 18px Georgia, serif';
    ctx.fillText('Eduvantaa Academic Team', w - 340, footerLineY - 15);

    // Badge
    const bx = w - 140;
    const by = 130;

    ctx.fillStyle = currentTheme.primary;
    ctx.beginPath();
    ctx.arc(bx, by, 35, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(bx, by, 28, 0, Math.PI * 2);
    ctx.stroke();

    // Badge Center Star
    ctx.fillStyle = '#ffffff';
    ctx.font = '32px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('★', bx, by + 2);

    // Reset baseline properties for canvas state tracking safety
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fixed High Quality crisp layout definitions
    canvas.width = 1000;
    canvas.height = 700;

    // Use document.fonts API if available to ensure custom typography updates render correctly
    if (document.fonts) {
      document.fonts.ready.then(() => {
        renderCanvasContent(ctx, canvas);
      });
    } else {
      renderCanvasContent(ctx, canvas);
    }
  }, [studentName, subjectName, completionDate, variantColor, currentTheme]);

  const generatePDF = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      /**
       * SAVE CERTIFICATE TO DATABASE
       */
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);

        await fetch(
          `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/courses/certificate/generate`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              userId: parsedUser.id,
              courseId,
              courseTitle: subjectName
            })
          }
        );
      }

      /**
       * DOWNLOAD PDF
       */
      const imgData = canvas.toDataURL('image/jpeg', 1.0);

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [1000, 700]
      });

      pdf.addImage(imgData, 'JPEG', 0, 0, 1000, 700);
      pdf.save(`Certificate-${(subjectName || 'Course').replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      console.error('Certificate generation failed:', error);
    }
  };

  if (downloadModeOnly) {
    return (
      <>
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        <Button
          variant="contained"
          onClick={generatePDF}
          startIcon={<DownloadIcon />}
          sx={{
            background: '#3B592D',
            color: '#ffffff',
            fontWeight: '600',
            textTransform: 'none',
            borderRadius: '8px',
            '&:hover': {
              background: '#2c4422'
            }
          }}
        >
          Generate & Download Certificate
        </Button>
      </>
    );
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          maxWidth: '650px',
          borderRadius: '8px',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)'
        }}
      />

      <div style={{ marginTop: '15px' }}>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={generatePDF}
          sx={{
            background: '#3B592D',
            '&:hover': {
              background: '#2c4422'
            }
          }}
        >
          Download PDF Copy
        </Button>
      </div>
    </div>
  );
};

export default Certificate;