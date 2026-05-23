import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import YouTube from 'react-youtube';

const IndividualCourseView = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const course = state?.course;

  // Track state structures for dynamic validation calculations
  const [lessons, setLessons] = useState([]); 
  const [courseAssignments, setCourseAssignments] = useState([]); // Dynamic Assignments state
  const [courseProgress, setCourseProgress] = useState(0);
  const [lessonProgressMap, setLessonProgressMap] = useState({});
  const [assignmentProgressMap, setAssignmentProgressMap] = useState({}); // Assignment submission map
  const [expandedLessonId, setExpandedLessonId] = useState(null);
  
  // Quiz state parameters mapped across sub-lessons
  const [selectedAnswers, setSelectedAnswers] = useState({}); 
  const [quizErrors, setQuizErrors] = useState({}); 
  const [quizLockedMap, setQuizLockedMap] = useState({}); 
  
  // FIXED: Corrected state syntax for tracking certificate generation
  const [isGeneratingCertificate, setIsGeneratingCertificate] = useState(false);
  const [uploadingAssignmentId, setUploadingAssignmentId] = useState(null);

  // Stream Player Controller References
  const [isPlaying, setIsPlaying] = useState(false);
  const activePlayerInstanceRef = useRef(null);

  const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  /**
   * Smart Extractor Object to handle database identities safely.
   */
  const getUserIdentityContext = () => {
    const directUserId = localStorage.getItem('userId');
    const rawUser = localStorage.getItem('user');

    let detectedId = directUserId || '';

    if (!detectedId && rawUser) {
      try {
        const parsed = JSON.parse(rawUser);
        detectedId = parsed.id || parsed._id || parsed.userId || '';
      } catch (e) {
        detectedId = rawUser;
      }
    }

    const fallbackUuid = "20ca93cf-d6a8-4647-91c8-4396d9c0a28c";
    const currentIdString = detectedId ? String(detectedId).trim() : fallbackUuid;

    return { asString: currentIdString };
  };

  const userIdContext = getUserIdentityContext();

  // Video track timeline skip variables
  const videoTimeTracker = useRef(0);
  const skipAlertTriggered = useRef(false);
  const playbackIntervalRef = useRef(null);
  const currentLessonIdRef = useRef(null);

  useEffect(() => {
    currentLessonIdRef.current = expandedLessonId;
    // Reset video tracking parameters when expanding a new lesson context unit
    videoTimeTracker.current = 0;
    setIsPlaying(false);
    activePlayerInstanceRef.current = null;
  }, [expandedLessonId]);

  useEffect(() => {
    if (course) {
      fetchCourseAndProgressData();
    }
    return () => clearInterval(playbackIntervalRef.current);
  }, [course]);

  const fetchCourseAndProgressData = async () => {
    try {
      // 1. Fetch Lessons Data
      const lessonsResponse = await fetch(`${backendUrl}/api/courses/${course.id}/lessons`);
      const lessonsData = await lessonsResponse.json();
      if (lessonsResponse.ok) {
        setLessons(lessonsData.lessons || lessonsData.data || lessonsData || []);
      }

      // 2. Fetch Assignments tied explicitly to this specific course group
      const assignmentsResponse = await fetch(`${backendUrl}/api/assignments/${userIdContext.asString}`);
      const assignmentsData = await assignmentsResponse.json();
      if (assignmentsResponse.ok) {
        // Filter elements mapping only to this running course scope context identification
        const filteredTasks = (assignmentsData.assignments || []).filter(
          (task) => task.course_id === course.id || task.course_title === course.title
        );
        setCourseAssignments(
          filteredTasks.map(task => ({
            id: task.id,
            title: task.title,
            description: task.description,
            due_date: task.due_date,
            max_marks: task.max_marks,
            status: task.status || "Pending",
            feedback: task.feedback || "",
            submitted_url: task.submitted_url || null
          }))
        );

        // Map submission tracking parameters natively
        const assignMap = {};
        filteredTasks.forEach(task => {
          assignMap[String(task.id)] = {
            status: task.status, // Approved / Rejected / Submitted / Pending
            submitted: task.status === "Approved" || task.status === "Submitted"
          };
        });
        setAssignmentProgressMap(assignMap);
      }

      // 3. Fetch Progress tracking records 
      const response = await fetch(`${backendUrl}/api/courses/progress/${userIdContext.asString}/${course.id}`);
      const data = await response.json();
      
      if (response.ok && data.data) {
        const mapping = {};
        const lockedQuizzes = {};
        
        data.data.forEach(item => {
          const lessonKey = String(item.lesson_id);
          mapping[lessonKey] = {
            content_read: !!item.content_read,
            video_watched: !!item.video_watched,
            quiz_completed: !!item.quiz_completed
          };
          if (item.quiz_completed) {
            lockedQuizzes[lessonKey] = true;
          }
        });
        setLessonProgressMap(mapping);
        setQuizLockedMap(lockedQuizzes);
      }

      // 4. Fetch Global Cumulative Course Progress Ratio
      const enrollmentResponse = await fetch(`${backendUrl}/api/courses/user/${userIdContext.asString}`);
      const enrollmentData = await enrollmentResponse.json();
      if (enrollmentResponse.ok && enrollmentData.enrollments) {
        const match = enrollmentData.enrollments.find(e => e.course_id === course.id);
        if (match) setCourseProgress(match.total_progress || 0);
      }

    } catch (err) {
      console.error('Error fetching backend tracking states:', err);
    }
  };

  // Re-calculates and pushes progress to server using the updated 15-25-15-45 structural distribution formula
  const triggerProgressUpdateBackend = async (lessonId, metricType, completionState) => {
    try {
      const response = await fetch(`${backendUrl}/api/courses/progress/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userIdContext.asString, 
          courseId: course.id,
          lessonId: lessonId ? parseInt(lessonId, 10) : null, 
          type: metricType,
          isComplete: completionState,
          totalLessons: lessons.length,
          weightDistribution: { content: 15, video: 25, quiz: 15, assignment: 45 }
        })
      });

      const data = await response.json();
      if (response.ok) {
        setCourseProgress(data.updatedTotalProgress || 0);
        if (lessonId) {
          const lessonKey = String(lessonId);
          setLessonProgressMap(prev => ({
            ...prev,
            [lessonKey]: { ...prev[lessonKey], [metricType]: completionState }
          }));
        }
        if (metricType === 'content_read') {
          alert("Submilestones updated successfully!");
        }
      }
    } catch (err) {
      console.error('Failed processing pipeline progress save:', err);
    }
  };

  // NEW: Certificate Generation handler triggered on completion
const handleDownloadCertificate = async () => {
  try {
    setIsGeneratingCertificate(true);

    const response = await fetch(
      `${backendUrl}/api/courses/certificate/generate`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userIdContext.asString,
          courseId: course.id,
          courseTitle: course.title,
          studentName: localStorage.getItem("name") || "Student",
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Certificate generation failed");
    }

    // ✅ FIX: download NOT blob
    const certificateData = JSON.stringify(data.certificate, null, 2);
    const blob = new Blob([certificateData], { type: "application/json" });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `${course.title.replace(/\s+/g, "_")}_certificate.json`;

    document.body.appendChild(link);
    link.click();

    link.remove();
    window.URL.revokeObjectURL(url);

    alert("🎉 Certificate downloaded successfully!");
  } catch (err) {
    console.error("Certificate error:", err);
    alert(err.message || "Failed to generate certificate.");
  } finally {
    setIsGeneratingCertificate(false);
  }
};
  // File Upload Logic directly embedded inside the course pipeline framework
  const handleAssignmentDirectUpload = async (e, assignmentId) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploadingAssignmentId(assignmentId);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('assignmentId', assignmentId);
      formData.append('userId', userIdContext.asString);

      const response = await fetch(`${backendUrl}/api/assignments/submit`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        alert("🎉 Assignment uploaded successfully from Course Panel view!");
        fetchCourseAndProgressData();
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Failed uploading file");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploadingAssignmentId(null);
    }
  };

  // VIDEO TRACK TICK SYSTEM WITH FORCED RUNSPEED & FORWARD PROTECTION RULES
  const startPlaybackTrackingLoop = (player) => {
    activePlayerInstanceRef.current = player;
    setIsPlaying(true);
    clearInterval(playbackIntervalRef.current);
    playbackIntervalRef.current = setInterval(() => {
      if (!player || typeof player.getCurrentTime !== 'function') return;
      
      const currentRealTime = player.getCurrentTime();

      // 1. Core Speed Bypass Intercept Guard
      if (typeof player.getPlaybackRate === 'function' && typeof player.setPlaybackRate === 'function') {
        const currentSpeed = player.getPlaybackRate();
        if (currentSpeed > 1.0) {
          player.setPlaybackRate(1.0); // Drop processing state baseline back down immediately
          alert("⚠️ Variable playback speeds are disabled! Please watch the stream at normal pace.");
          return;
        }
      }

      // 2. Anti-Forward Timeline Jump Safeguards
      if (currentRealTime - videoTimeTracker.current > 2) {
        player.seekTo(videoTimeTracker.current); // Force rewind lock back to highest checked timestamp point
        if (!skipAlertTriggered.current) {
          alert("⚠️ Video Skipping Blocked! Complete watching full section.");
          skipAlertTriggered.current = true;
          setTimeout(() => { skipAlertTriggered.current = false; }, 3000);
        }
      } else if (currentRealTime > videoTimeTracker.current) {
        videoTimeTracker.current = currentRealTime;
      }

      const totalDuration = player.getDuration();
      if (totalDuration > 0 && totalDuration - currentRealTime < 3) {
        const lessonId = currentLessonIdRef.current;
        if (lessonId && !lessonProgressMap[String(lessonId)]?.video_watched) {
          clearInterval(playbackIntervalRef.current);
          triggerProgressUpdateBackend(lessonId, 'video_watched', true);
        }
      }
    }, 500);
  };

  const stopPlaybackTrackingLoop = () => {
    setIsPlaying(false);
    clearInterval(playbackIntervalRef.current);
  };

  const togglePlayStateViaOverlay = () => {
    const player = activePlayerInstanceRef.current;
    if (!player) return;

    if (isPlaying) {
      player.pauseVideo();
    } else {
      player.playVideo();
    }
  };

  const handleSelectQuizOption = (lessonId, quizIndex, selectedOption) => {
    const lessonKey = String(lessonId);
    if (quizLockedMap[lessonKey]) return;
    setSelectedAnswers(prev => ({ ...prev, [`${lessonKey}-${quizIndex}`]: selectedOption }));
  };

  const verifyQuizAnswersBatch = (lessonTarget) => {
     setQuizErrors({});
    const lessonKey = String(lessonTarget.id);
    const quizSet = lessonTarget.quiz || [];
    let allClear = true;
    const newErrors = {};

    quizSet.forEach((item, index) => {
      if (selectedAnswers[`${lessonKey}-${index}`] !== item.answer) {
        allClear = false;
        newErrors[`${lessonKey}-${index}`] = true; 
      }
    });

    if (!allClear) {
      setQuizErrors(prev => ({ ...prev, ...newErrors }));
      alert("❌ Some answers are incorrect! Please review and retry.");
    } else {
      setQuizLockedMap(prev => ({ ...prev, [lessonKey]: true }));
      triggerProgressUpdateBackend(lessonTarget.id, 'quiz_completed', true);
      alert("🏆 Perfect Score! Quiz module progress registered.");
    }
  };

  // FIXED: Calculations modified so that assignments only grant percentage points when "Approved"
  const calculateFrontendProgressValue = () => {
    if (lessons.length === 0) return courseProgress;
    
    let totalScorePoints = 0;
    const lessonWeightShare = 55 / lessons.length; 
    
    lessons.forEach(lesson => {
      const status = lessonProgressMap[String(lesson.id)] || {};
      if (status.content_read) totalScorePoints += (lessonWeightShare * (15 / 55));
      if (status.video_watched) totalScorePoints += (lessonWeightShare * (25 / 55));
      if (status.quiz_completed) totalScorePoints += (lessonWeightShare * (15 / 55));
    });

    if (courseAssignments.length > 0) {
      const assignmentWeightShare = 45 / courseAssignments.length; 
      courseAssignments.forEach(task => {
        const stateObj = assignmentProgressMap[String(task.id)];
        // STRICT CHECK: Only award points if approved by admin
        if (stateObj?.status === "Approved") {
          totalScorePoints += assignmentWeightShare;
        }
      });
    }

    return Math.min(Math.round(totalScorePoints), 100);
  };

  // NEW HELPER FUNCTION: Check if all criteria are completed except admin task approval
  const checkIsPendingApprovalOnly = () => {
    if (lessons.length === 0) return false;

    // Check if any lesson sub-milestones are incomplete
    for (let lesson of lessons) {
      const status = lessonProgressMap[String(lesson.id)] || {};
      if (!status.content_read || !status.video_watched || !status.quiz_completed) {
        return false;
      }
    }

    // If there are no assignments but lessons are done, it would be 100% already
    if (courseAssignments.length === 0) return false;

    // Check if assignments have been submitted but not all are approved yet
    const hasSubmittedSomething = courseAssignments.some(task => {
      const stateObj = assignmentProgressMap[String(task.id)];
      return stateObj?.status === "Submitted";
    });

    const allApproved = courseAssignments.every(task => {
      const stateObj = assignmentProgressMap[String(task.id)];
      return stateObj?.status === "Approved";
    });

    return hasSubmittedSomething && !allApproved;
  };

  const currentDisplayProgress = calculateFrontendProgressValue();
  const isPendingApprovalOnly = checkIsPendingApprovalOnly();

  if (!course) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem', color: '#64748b' }}>
        <h3>No Course Context Transferred</h3>
        <button onClick={() => navigate(-1)} style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}>Go Back</button>
      </div>
    );
  }

  

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#1e293b', padding: '3rem 2rem', fontFamily: "'Poppins', sans-serif", display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      
      {/* BACK NAVIGATION BAR */}
      <div style={{ width: '100%', maxWidth: '950px', marginBottom: '2.5rem' }}>
        <button onClick={() => navigate(-1)} style={{ background: '#ffffff', border: '1px solid #e2e8f0', color: '#475569', padding: '0.65rem 1.5rem', borderRadius: '12px', cursor: 'pointer', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>←</span> Back to System Hub
        </button>
      </div>

      {/* DYNAMIC PROGRESS HEADLINE CARD CONTAINER */}
      <div style={{ width: '100%', maxWidth: '950px', background: '#ffffff', padding: '3.5rem', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(15,23,42,0.02)', marginBottom: '3rem' }}>
        <span style={{ fontSize: '0.8rem', background: '#eef6f0', color: '#3B592D', padding: '0.4rem 1rem', borderRadius: '50px', fontWeight: '700', textTransform: 'uppercase' }}>
          {course.category || 'Engineering'} Track
        </span>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginTop: '1.25rem', color: '#0f172a', letterSpacing: '-0.5px' }}>{course.title}</h1>
        <p style={{ color: '#64748b', fontSize: '1.05rem', marginTop: '1rem', lineHeight: '1.65' }}>{course.desc || course.description}</p>

        {/* RE-CALCULATED PROGRESS LEGEND BAR */}
        <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '2rem', marginTop: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
            <span style={{ fontWeight: '700', fontSize: '0.95rem', color: '#475569' }}>Academic Milestones (Content 15% | Video 25% | Quiz 15% | Task 45%)</span>
            <span style={{ fontWeight: '800', fontSize: '1.1rem', color: '#3B592D' }}>{currentDisplayProgress}% Complete</span>
          </div>
          <div style={{ width: '100%', height: '12px', background: '#e2e8f0', borderRadius: '50px', overflow: 'hidden' }}>
            <div style={{ width: `${currentDisplayProgress}%`, height: '100%', background: 'linear-gradient(90deg, #3B592D 0%, #527c3f 100%)', borderRadius: '50px', transition: 'width 0.4s ease' }} />
          </div>
        </div>

        {/* CONDITION 1: SHOW DOWNLOAD PANEL ONLY IF PROGRESS IS TRULY 100% */}
        {currentDisplayProgress === 100 && (
          <div style={{ marginTop: '2rem', padding: '2rem', background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', border: '1px solid #bbf7d0', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1.5rem', animation: 'fadeIn 0.5s ease' }}>
            <div>
              <h3 style={{ margin: 0, color: '#14532d', fontWeight: '800', fontSize: '1.3rem' }}>Congratulations! You've Completed the Course</h3>
              <p style={{ margin: '0.25rem 0 0 0', color: '#166534', fontSize: '0.95rem' }}>Your academic achievements are saved. You can now download your credential validation certificate.</p>
            </div>
            <button 
              onClick={handleDownloadCertificate}
              disabled={isGeneratingCertificate}
              style={{ background: '#3B592D', color: '#ffffff', border: 'none', padding: '0.85rem 2rem', borderRadius: '12px', fontWeight: '700', fontSize: '0.95rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(59, 89, 45, 0.25)', transition: 'transform 0.2s, background 0.2s', whiteSpace: 'nowrap' }}
              onMouseEnter={(e) => e.target.style.background = '#2c4322'}
              onMouseLeave={(e) => e.target.style.background = '#3B592D'}
            >
              {isGeneratingCertificate ? "Generating PDF..." : "Claim Certificate 🏆"}
            </button>
          </div>
        )}

        {/* CONDITION 2: SHOW WAITING NOTICE IF REQUISITES ARE MET BUT SUBMISSIONS ARE UNAPPROVED */}
        {currentDisplayProgress < 100 && isPendingApprovalOnly && (
          <div style={{ marginTop: '2rem', padding: '2rem', background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)', border: '1px solid #fde68a', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '0.5rem', animation: 'fadeIn 0.5s ease' }}>
            <h3 style={{ margin: 0, color: '#92400e', fontWeight: '800', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              ⏳ Certificate Status: Pending Approval
            </h3>
            <p style={{ margin: 0, color: '#b45309', fontSize: '0.95rem', lineHeight: '1.5' }}>
              Your course items and assignment submissions are currently undergoing testing and administrative review. <strong>Your official credential certificate will be automatically generated here as soon as your submitted assignments are approved!</strong>
            </p>
          </div>
        )}
      </div>

      {/* CORE ROADMAP COURSE ACORDION SUB-UNITS */}
      <div style={{ width: '100%', maxWidth: '950px', marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1.5rem', color: '#0f172a' }}>Lessons Curriculum</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {lessons.map((lesson) => {
            const lessonKey = String(lesson.id);
            const isExpanded = String(expandedLessonId) === lessonKey;
            const status = lessonProgressMap[lessonKey] || { content_read: false, video_watched: false, quiz_completed: false };
            
            let unitWeight = 0;
            if (status.content_read) unitWeight += 15;
            if (status.video_watched) unitWeight += 25;
            if (status.quiz_completed) unitWeight += 15;

            return (
              <div key={lessonKey} style={{ background: '#ffffff', border: isExpanded ? '2px solid #3B592D' : '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden' }}>
                <div onClick={() => setExpandedLessonId(isExpanded ? null : lesson.id)} style={{ padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700' }}>{lesson.title}</h4>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.4rem', fontSize: '0.8rem', color: '#94a3b8' }}>
                      <span style={{ color: status.content_read ? '#3B592D' : '#94a3b8' }}>📖 Read ({status.content_read ? '15%' : '0%'})</span>
                      <span style={{ color: status.video_watched ? '#3B592D' : '#94a3b8' }}>📺 Video ({status.video_watched ? '25%' : '0%'})</span>
                      <span style={{ color: status.quiz_completed ? '#3B592D' : '#94a3b8' }}>📝 Quiz ({status.quiz_completed ? '15%' : '0%'})</span>
                    </div>
                  </div>
                  <span style={{ fontWeight: '700', fontSize: '0.85rem', background: '#f1f5f9', padding: '0.4rem 0.8rem', borderRadius: '6px' }}>{unitWeight}/55% Points</span>
                </div>

                {isExpanded && (
                  <div style={{ padding: '2.5rem', borderTop: '1px solid #f1f5f9', background: '#fcfdfb', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div>
  <h5
    style={{
      margin: '0 0 0.5rem 0',
      fontWeight: '700'
    }}
  >
    Core Reading Resource
  </h5>

<div
  style={{
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    padding: '1.5rem',
    borderRadius: '12px',
    lineHeight: '1.8',
    color: '#475569',
    overflowWrap: 'break-word',
    whiteSpace: 'pre-line'
  }}
>
  {lesson.content}
</div>
  <button
    disabled={status.content_read}
    onClick={() =>
      triggerProgressUpdateBackend(
        lesson.id,
        'content_read',
        true
      )
    }
    style={{
      marginTop: '1rem',
      background: '#3B592D',
      color: '#fff',
      border: 'none',
      padding: '0.5rem 1.2rem',
      borderRadius: '8px',
      cursor: 'pointer'
    }}
  >
    {status.content_read
      ? '✓ Completed'
      : 'Mark Material Read (+15%)'}
  </button>
</div>

                    {/* VIDEOPLAYER WITH TIMELINE RULES */}
                    <div>
                      <h5 style={{ margin: '0 0 0.75rem 0', fontWeight: '700' }}>Lecture Stream</h5>
                      <div 
                        style={{ 
                          width: '100%', 
                          position: 'relative', 
                          overflow: 'hidden', 
                          borderRadius: '16px', 
                          boxShadow: '0 8px 24px rgba(0,0,0,0.06)', 
                          border: '1px solid #e2e8f0', 
                          background: '#000000' 
                        }}
                        onContextMenu={(e) => e.preventDefault()}
                      >
                        <div style={{ width: '100%', paddingTop: '56.25%', position: 'relative', overflow: 'hidden' }}>
                          <div style={{ position: 'absolute', top: '-50px', left: 0, width: '100%', height: 'calc(100% + 100px)' }}>
                            <YouTube 
                              videoId={lesson.videoId} 
                              onReady={(e) => { activePlayerInstanceRef.current = e.target; }}
                              onPlay={(e) => startPlaybackTrackingLoop(e.target)} 
                              onPause={stopPlaybackTrackingLoop} 
                              onEnd={stopPlaybackTrackingLoop} 
                              className="youtube-iframe-wrapper"
                              style={{ width: '100%', height: '100%' }}
                              opts={{ 
                                width: '100%', 
                                height: '100%',
                                playerVars: {
                                  controls: 0,
                                  disablekb: 1,
                                  modestbranding: 1,
                                  rel: 0,
                                  fs: 0,
                                  iv_load_policy: 3,
                                }
                              }} 
                            />
                          </div>

                          <div 
                            onClick={togglePlayStateViaOverlay}
                            style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: '100%',
                              zIndex: 1000,
                              background: 'rgba(0, 0, 0, 0.0)', 
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            {!isPlaying && (
                              <div style={{
                                background: 'rgba(59, 89, 45, 0.9)',
                                color: '#ffffff',
                                width: '70px',
                                height: '70px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.5rem',
                                boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                                pointerEvents: 'none', 
                                paddingLeft: '5px' 
                              }}>
                                ▶
                              </div>
                            )}
                          </div>

                        </div>
                      </div>
                    </div>

                    {/* QUIZ DRAWER LAYER */}
                    <div style={{ borderTop: '1px dashed #e2e8f0', paddingTop: '1.5rem' }}>
                      <h5 style={{ fontWeight: '800', marginBottom: '1rem' }}>Module Testing Assessment</h5>
                      {lesson.quiz?.map((quizItem, qIndex) => (
                        <div key={qIndex} style={{ padding: '1rem', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', marginBottom: '1rem' }}>
                          <p style={{ margin: '0 0 0.75rem 0', fontWeight: '700' }}>Q{qIndex+1}: {quizItem.question}</p>
                          {quizItem.options?.map((opt, oIndex) => (
                            <button
  key={oIndex}
  onClick={() => handleSelectQuizOption(lesson.id, qIndex, opt)}
  style={{
    display: 'block',
    width: '100%',
    padding: '0.65rem 1rem',
    textAlign: 'left',
    marginBottom: '0.5rem',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',

    background: (() => {

      const selected =
        selectedAnswers[`${lessonKey}-${qIndex}`];

      const hasError =
        quizErrors[`${lessonKey}-${qIndex}`];

      /* WRONG ANSWER → RED */
      if (
        hasError &&
        selected === opt &&
        opt !== quizItem.answer
      ) {
        return '#dc2626';
      }

      /* CORRECT ANSWER → GREEN */
      if (
        quizLockedMap[lessonKey] &&
        opt === quizItem.answer
      ) {
        return '#15803d';
      }

      /* SELECTED OPTION */
      if (selected === opt) {
        return '#3B592D';
      }

      return '#f8fafc';

    })(),

    color: (() => {

      const selected =
        selectedAnswers[`${lessonKey}-${qIndex}`];

      const hasError =
        quizErrors[`${lessonKey}-${qIndex}`];

      if (
        hasError &&
        selected === opt &&
        opt !== quizItem.answer
      ) {
        return '#ffffff';
      }

      if (
        quizLockedMap[lessonKey] &&
        opt === quizItem.answer
      ) {
        return '#ffffff';
      }

      if (selected === opt) {
        return '#ffffff';
      }

      return '#475569';

    })(),

    cursor: 'pointer',
    transition: 'all 0.25s ease'
  }}
>
  {opt}
</button>
                          ))}
                        </div>
                      ))}
                      <button disabled={quizLockedMap[lessonKey]} onClick={() => verifyQuizAnswersBatch(lesson)} style={{ background: '#3B592D', color: '#fff', padding: '0.6rem 1.5rem', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                        {quizLockedMap[lessonKey] ? '✓ Quiz Verified' : 'Submit Concept Answers (+15%)'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* NEW INTEGRATED ASSIGNMENTS SECTION */}
      <div style={{ width: '100%', maxWidth: '950px', marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1.5rem', color: '#0f172a' }}>
          Course Core Tasks & Handouts (Value: 45%)
        </h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {courseAssignments.length === 0 ? (
            <div style={{ padding: '3rem', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', textAlign: 'center', color: '#94a3b8' }}>
              No specific assignments have been pushed to this course group pipeline stack yet.
            </div>
          ) : (
            courseAssignments.map((task) => {
              const taskState = assignmentProgressMap[String(task.id)];
              const isApproved = taskState?.status === "Approved";

              return (
                <div key={task.id} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700', color: '#0f172a' }}>{task.title || task.topic}</h4>
                      <p style={{ margin: '0.3rem 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                        Max Mark Metrics: {task.max_marks || '100'} Marks | Due: {new Date(task.due_date).toLocaleDateString()}
                      </p>
                    </div>
                    <span style={{ fontSize: '0.8rem', fontWeight: '700', padding: '0.3rem 0.8rem', borderRadius: '6px', backgroundColor: isApproved ? '#dcfce7' : taskState?.status === "Submitted" ? '#e0f2fe' : '#fef3c7', color: isApproved ? '#15803d' : taskState?.status === "Submitted" ? '#0369a1' : '#d97706' }}>
                      {taskState?.status === "Approved" && "Approved (+45%)"}
                      {taskState?.status === "Submitted" && "Submitted (Pending Review)"}
                      {taskState?.status === "Rejected" && "Rejected"}
                      {(!taskState?.status || taskState?.status === "Pending") && "Action Required"}
                    </span>
                  </div>

                  <p style={{ color: '#475569', fontSize: '0.95rem', margin: 0, lineHeight: '1.5' }}>
                    {task.description || "Review resources and build requested system applications."}
                  </p>

                  {taskState?.status === "Rejected" && (
                    <div style={{ padding: "1rem", borderRadius: "10px", background: "#fff1f2", border: "1px solid #fecdd3", color: "#b91c1c", fontSize: "0.9rem" }}>
                      <strong>❌ Rejected by Admin:</strong> {task.feedback || "No feedback provided."}
                    </div>
                  )}

                 <div
  style={{
    borderTop: '1px solid #f1f5f9',
    paddingTop: '1rem',
    marginTop: '0.5rem',
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: '1rem'
  }}
>
  {/* APPROVED */}
  {taskState?.status === "Approved" ? (
    <span
      style={{
        color: '#15803d',
        fontWeight: '700',
        fontSize: '0.95rem'
      }}
    >
      ✓ Assignment Approved & Locked
    </span>
  ) : taskState?.status === "Submitted" ? (

    /* SUBMITTED BUT NOT APPROVED */
    <>
      <span
        style={{
          color: '#0369a1',
          fontWeight: '600',
          fontSize: '0.9rem'
        }}
      >
        Waiting for admin review
      </span>

      <button
        onClick={async () => {
          try {

            const response = await fetch(
              `${backendUrl}/api/assignments/unsubmit`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  assignmentId: task.id,
                  userId: userIdContext.asString
                })
              }
            );

            const data = await response.json();

            if (!response.ok) {
              throw new Error(data.message);
            }

            alert("Assignment unsubmitted successfully");

            fetchCourseAndProgressData();

          } catch (err) {
            console.error(err);
            alert(err.message || "Failed to unsubmit");
          }
        }}
        style={{
          background: '#dc2626',
          color: '#ffffff',
          border: 'none',
          padding: '0.55rem 1.4rem',
          borderRadius: '10px',
          cursor: 'pointer',
          fontWeight: '600'
        }}
      >
        Unsubmit Assignment
      </button>
    </>
  ) : (

    /* PENDING / REJECTED */
    <label
      style={{
        background:
          taskState?.status === "Rejected"
            ? '#b91c1c'
            : '#3B592D',

        color: '#fff',
        padding: '0.55rem 1.5rem',
        borderRadius: '10px',
        fontWeight: '600',
        fontSize: '0.9rem',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center'
      }}
    >
      {uploadingAssignmentId === task.id
        ? "Uploading..."
        : taskState?.status === "Rejected"
        ? "🔁 Re-upload Document"
        : "Upload Assignment"}

      <input
        type="file"
        hidden
        disabled={uploadingAssignmentId === task.id}
        onChange={(e) =>
          handleAssignmentDirectUpload(e, task.id)
        }
      />
    </label>
  )}
</div>
                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
};

export default IndividualCourseView;