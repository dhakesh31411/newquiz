import React, { useState, useEffect, useRef } from 'react';
import { Clock, CheckCircle2, ArrowRight, ArrowLeft, AlertCircle, Film, Send, ShieldAlert } from 'lucide-react';
import LogoHeader from '../components/LogoHeader';
import BackHeader from '../components/BackHeader';

export default function MovieQuizView({ quizId, userSession, logoUrl, websiteName = 'QuizMaster', onQuizComplete, onBackToDashboard }) {
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(300);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // Modals state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);

  // Anti-cheating tab switch state
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [showTabWarning, setShowTabWarning] = useState(false);

  const timerRef = useRef(null);
  const startTimeRef = useRef(Date.now());

  // Fetch quiz session & randomized questions
  useEffect(() => {
    const startQuizSession = async () => {
      try {
        const res = await fetch(`/api/quizzes/${quizId}/start?userId=${userSession.id}`);
        const data = await res.json();

        if (res.ok && data.success) {
          setQuiz(data.quiz);
          setQuestions(data.questions);
          setTimeLeft(data.quiz.time_limit_seconds || 300);
        } else {
          setError(data.message || 'Unable to start quiz session.');
        }
      } catch (err) {
        setError('Server connection error.');
      } finally {
        setLoading(false);
      }
    };

    startQuizSession();
  }, [quizId, userSession]);

  // Anti-cheating tab switch listener (visibilitychange)
  useEffect(() => {
    if (loading || !quiz || submitting) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount(prev => prev + 1);
        setShowTabWarning(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [loading, quiz, submitting]);

  // Countdown timer
  useEffect(() => {
    if (loading || !quiz || submitting) return;

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [loading, quiz, submitting]);

  const handleSelectOption = (questionId, optionKey) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optionKey
    }));
  };

  const handleExecuteSubmit = async () => {
    setShowConfirmModal(false);
    if (submitting) return;
    setSubmitting(true);
    clearInterval(timerRef.current);

    const elapsedSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);

    try {
      const res = await fetch('/api/quizzes/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userSession.id,
          quizId: quiz.id,
          answers: selectedAnswers,
          timeSpentSeconds: elapsedSeconds,
          tabSwitchCount
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        onQuizComplete(data.result);
      } else {
        alert(data.message || 'Submission failed.');
        setSubmitting(false);
      }
    } catch (err) {
      alert('Error submitting quiz.');
      setSubmitting(false);
    }
  };

  const handleAutoSubmit = () => {
    alert('⏱️ Time has expired! Your quiz is being automatically submitted now.');
    handleExecuteSubmit();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="glass-panel" style={{ maxWidth: '650px', margin: '40px auto', padding: '40px', textAlign: 'center' }}>
        <LogoHeader title="Preparing Movie Photo Quiz..." logoUrl={logoUrl} />
        <p style={{ color: 'var(--text-muted)' }}>Loading posters, scenes, and countdown timer...</p>
      </div>
    );
  }

  if (error || !questions.length) {
    return (
      <div className="glass-panel" style={{ maxWidth: '600px', margin: '40px auto', padding: '40px', textAlign: 'center' }}>
        <LogoHeader title="Quiz Unavailable" logoUrl={logoUrl} />
        <p style={{ color: 'var(--accent-rose)', marginBottom: '20px' }}>{error || 'No questions available.'}</p>
        <button onClick={onBackToDashboard} className="btn btn-secondary">Back to Dashboard</button>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);
  const isTimeWarning = timeLeft < 60;

  // Resolve question images array (support 1, 2, 3, 4+ photos)
  const qImagesList = currentQ.images && Array.isArray(currentQ.images) && currentQ.images.length > 0
    ? currentQ.images
    : (currentQ.image ? [currentQ.image] : []);

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto' }}>
      {/* Back Button with Warning Trigger */}
      <BackHeader label="Back to Dashboard" onBack={() => setShowExitModal(true)} />

      {/* Anti-Cheating Tab Switch Warning Banner */}
      {showTabWarning && (
        <div style={{
          background: 'rgba(244, 63, 94, 0.15)',
          border: '1px solid rgba(244, 63, 94, 0.4)',
          color: 'var(--accent-rose)',
          padding: '12px 18px',
          borderRadius: '12px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.88rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShieldAlert size={20} />
            <span>
              <strong>Warning:</strong> Tab switching detected ({tabSwitchCount} time(s)). Please remain on the quiz window to avoid disqualification.
            </span>
          </div>
          <button 
            onClick={() => setShowTabWarning(false)} 
            style={{ background: 'none', border: 'none', color: 'var(--accent-rose)', fontWeight: 700, cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Quiz Top Bar */}
      <div className="glass-panel" style={{ 
        padding: '16px 24px', 
        marginBottom: '20px', 
        display: 'flex', 
        justify: 'space-between', 
        alignItems: 'center',
        border: isTimeWarning ? '1px solid rgba(244, 63, 94, 0.5)' : '1px solid var(--border-color)',
        boxShadow: isTimeWarning ? '0 0 20px rgba(244, 63, 94, 0.25)' : 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Film size={22} color="var(--accent-amber)" />
          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>QUIZ</span>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>{quiz.title}</div>
          </div>
        </div>

        {/* ⏱️ Countdown Timer */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          background: isTimeWarning ? 'rgba(244, 63, 94, 0.2)' : 'rgba(99, 102, 241, 0.15)',
          padding: '8px 16px',
          borderRadius: '12px',
          border: isTimeWarning ? '1px solid rgba(244, 63, 94, 0.4)' : '1px solid rgba(99, 102, 241, 0.3)'
        }}>
          <Clock size={20} color={isTimeWarning ? 'var(--accent-rose)' : 'var(--accent-primary)'} className={isTimeWarning ? 'spin' : ''} />
          <div>
            <div style={{ fontSize: '0.68rem', color: isTimeWarning ? 'var(--accent-rose)' : 'var(--text-muted)', fontWeight: 600 }}>TIMER</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, fontFamily: 'monospace', color: isTimeWarning ? 'var(--accent-rose)' : 'var(--text-main)' }}>
              {formatTime(timeLeft)}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
          <span>Question <strong>{currentIndex + 1}</strong> of {questions.length}</span>
          <span>{progressPercent}% Completed</span>
        </div>
        <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ width: `${progressPercent}%`, height: '100%', background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))', transition: 'width 0.3s ease' }} />
        </div>
      </div>

      {/* Movie Photo & Question Card */}
      <div className="glass-panel" style={{ padding: '28px', marginBottom: '24px' }}>
        {/* MULTI-MOVIE PHOTO DISPLAY WITH '+' SEPARATORS */}
        {qImagesList.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justify: 'center', 
              gap: '12px', 
              flexWrap: 'wrap',
              background: 'rgba(15, 23, 42, 0.5)',
              padding: '16px',
              borderRadius: '16px',
              border: '1px solid var(--border-color)'
            }}>
              {qImagesList.map((imgUrl, index) => (
                <React.Fragment key={index}>
                  <div style={{ 
                    flex: '1 1 180px',
                    maxWidth: qImagesList.length === 1 ? '100%' : '320px',
                    height: qImagesList.length === 1 ? '280px' : '180px', 
                    borderRadius: '12px', 
                    overflow: 'hidden', 
                    border: '1px solid var(--border-color)',
                    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.35)'
                  }}>
                    <img 
                      src={imgUrl} 
                      alt={`Movie Challenge Frame ${index + 1}`} 
                      onError={(e) => { e.target.src = '/movie1.jpg'; }}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>

                  {/* '+' Separator between movie photos */}
                  {index < qImagesList.length - 1 && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justify: 'center',
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                      color: '#fff',
                      fontSize: '1.4rem',
                      fontWeight: 800,
                      boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)',
                      flexShrink: 0
                    }}>
                      +
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '20px', lineHeight: 1.4 }}>
          {currentIndex + 1}. {currentQ.question_text}
        </h3>

        {/* Shuffled Options (A, B, C, D) with Option Photo Support */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: currentQ.options.some(o => Boolean(o.image)) ? 'repeat(auto-fit, minmax(220px, 1fr))' : 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '14px'
        }}>
          {currentQ.options.map(opt => {
            const isSelected = selectedAnswers[currentQ.id] === opt.key;
            const hasImg = Boolean(opt.image);

            return (
              <button
                key={opt.key}
                onClick={() => handleSelectOption(currentQ.id, opt.key)}
                style={{
                  display: 'flex',
                  flexDirection: hasImg ? 'column' : 'row',
                  alignItems: hasImg ? 'stretch' : 'center',
                  gap: '12px',
                  padding: hasImg ? '12px' : '14px 18px',
                  borderRadius: '14px',
                  background: isSelected ? 'rgba(99, 102, 241, 0.25)' : 'rgba(15, 23, 42, 0.6)',
                  border: isSelected ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                  boxShadow: isSelected ? '0 0 16px rgba(99, 102, 241, 0.35)' : 'none',
                  color: 'var(--text-main)',
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {hasImg && (
                  <div style={{ position: 'relative', width: '100%', height: '140px', borderRadius: '10px', overflow: 'hidden', background: '#000' }}>
                    <img 
                      src={opt.image} 
                      alt={`Option ${opt.key}`} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                    <div style={{
                      position: 'absolute',
                      top: '8px',
                      left: '8px',
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: isSelected ? 'var(--accent-primary)' : 'rgba(15, 23, 42, 0.85)',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      border: '1px solid rgba(255,255,255,0.2)'
                    }}>
                      {opt.key}
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', flex: 1 }}>
                  {!hasImg && (
                    <div style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '50%',
                      background: isSelected ? 'var(--accent-primary)' : 'rgba(255,255,255,0.08)',
                      color: isSelected ? '#fff' : 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      flexShrink: 0
                    }}>
                      {opt.key}
                    </div>
                  )}
                  <div style={{ flex: 1, fontWeight: 600 }}>{opt.text}</div>
                  {isSelected && <CheckCircle2 size={20} color="var(--accent-primary)" style={{ flexShrink: 0 }} />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation Buttons & Submit */}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
        <button
          onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
          disabled={currentIndex === 0}
          className="btn btn-secondary"
          style={{ opacity: currentIndex === 0 ? 0.5 : 1 }}
        >
          <ArrowLeft size={16} /> Previous
        </button>

        {currentIndex < questions.length - 1 ? (
          <button
            onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
            className="btn btn-primary"
          >
            Next Question <ArrowRight size={16} />
          </button>
        ) : (
          <button
            onClick={() => setShowConfirmModal(true)}
            disabled={submitting}
            className="btn btn-primary"
            style={{ background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)' }}
          >
            <Send size={16} /> Submit Quiz
          </button>
        )}
      </div>

      {/* ⚠️ Exit Quiz Confirmation Modal */}
      {showExitModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '420px', padding: '28px', background: '#1e293b', textAlign: 'center' }}>
            <AlertCircle size={44} color="var(--accent-rose)" style={{ marginBottom: '14px' }} />
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '8px' }}>Leave Active Quiz?</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>
              Are you sure you want to leave this quiz? Your current progress may be lost.
            </p>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setShowExitModal(false)} className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                Stay in Quiz
              </button>
              <button onClick={onBackToDashboard} className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center', color: 'var(--accent-rose)' }}>
                Leave Quiz
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ⚠️ Submit Confirmation Modal */}
      {showConfirmModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '420px', padding: '28px', background: '#1e293b', textAlign: 'center' }}>
            <AlertCircle size={44} color="var(--accent-amber)" style={{ marginBottom: '14px' }} />
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '8px' }}>Submit Quiz Confirmation</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>
              Are you sure you want to submit your quiz? Once submitted, your answers will be evaluated.
            </p>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={handleExecuteSubmit} className="btn btn-primary" style={{ flex: 1, justifyContent: 'center', background: 'var(--accent-emerald)' }}>
                Yes, Submit Now
              </button>
              <button onClick={() => setShowConfirmModal(false)} className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
