import React, { useState, useEffect, useRef } from 'react';
import { Clock, CheckCircle2, AlertTriangle, ArrowRight, ArrowLeft, ShieldAlert } from 'lucide-react';
import LogoHeader from '../components/LogoHeader';

export default function QuizView({ userSession, logoUrl, onQuizComplete }) {
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(300);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const timerRef = useRef(null);
  const startTimeRef = useRef(Date.now());

  // Fetch active quiz & questions
  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        const res = await fetch('/api/quizzes/active');
        const data = await res.json();

        if (res.ok && data.success) {
          setQuiz(data.quiz);
          setQuestions(data.questions);
          setTimeLeft(data.quiz.time_limit_seconds || 300);
        } else {
          setError('Unable to load quiz questions.');
        }
      } catch (err) {
        setError('Server connection error.');
      } finally {
        setLoading(false);
      }
    };

    fetchQuizData();
  }, []);

  // Handle Countdown Timer
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

  // Handle Option Selection
  const handleSelectOption = (questionId, optionKey) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optionKey
    }));
  };

  // Submit Quiz Action
  const handleSubmitQuiz = async () => {
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
          timeSpentSeconds: elapsedSeconds
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        onQuizComplete(data.result);
      } else {
        alert(data.message || 'Submission failed. Please try again.');
        setSubmitting(false);
      }
    } catch (err) {
      alert('Error submitting quiz. Please check internet connection.');
      setSubmitting(false);
    }
  };

  const handleAutoSubmit = () => {
    alert('⏱️ Time is up! Your quiz is automatically submitting now.');
    handleSubmitQuiz();
  };

  // Format seconds to MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="glass-panel" style={{ maxWidth: '600px', margin: '40px auto', padding: '40px', textAlign: 'center' }}>
        <LogoHeader title="Preparing Your Quiz..." logoUrl={logoUrl} />
        <p style={{ color: 'var(--text-muted)' }}>Loading questions and configuring countdown timer...</p>
      </div>
    );
  }

  if (error || !questions.length) {
    return (
      <div className="glass-panel" style={{ maxWidth: '600px', margin: '40px auto', padding: '40px', textAlign: 'center' }}>
        <LogoHeader title="Quiz Unavailable" logoUrl={logoUrl} />
        <p style={{ color: 'var(--accent-rose)', marginBottom: '20px' }}>{error || 'No active quiz questions found.'}</p>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);
  const isTimeWarning = timeLeft < 60;

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto' }}>
      {/* Quiz Top Bar with Live Countdown Timer */}
      <div className="glass-panel" style={{ 
        padding: '16px 24px', 
        marginBottom: '20px', 
        display: 'flex', 
        justify: 'space-between', 
        alignItems: 'center',
        border: isTimeWarning ? '1px solid rgba(244, 63, 94, 0.5)' : '1px solid var(--border-color)',
        boxShadow: isTimeWarning ? '0 0 20px rgba(244, 63, 94, 0.25)' : 'var(--shadow-sm)'
      }}>
        <div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>Student</span>
          <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>{userSession.name}</div>
        </div>

        {/* ⏱️ Countdown Timer Pill */}
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

      {/* Question Card */}
      <div className="glass-panel" style={{ padding: '32px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '24px', lineHeight: 1.4 }}>
          {currentIndex + 1}. {currentQ.question_text}
        </h3>

        {/* MCQ Options A, B, C, D with Option Photo Support */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: ['a','b','c','d'].some(k => Boolean(currentQ[`option_${k}_image`])) ? 'repeat(auto-fit, minmax(200px, 1fr))' : '1fr',
          gap: '12px'
        }}>
          {['A', 'B', 'C', 'D'].map(optKey => {
            const optionText = currentQ[`option_${optKey.toLowerCase()}`];
            const optionImg = currentQ[`option_${optKey.toLowerCase()}_image`];
            const isSelected = selectedAnswers[currentQ.id] === optKey;
            const hasImg = Boolean(optionImg);

            return (
              <button
                key={optKey}
                onClick={() => handleSelectOption(currentQ.id, optKey)}
                style={{
                  display: 'flex',
                  flexDirection: hasImg ? 'column' : 'row',
                  alignItems: hasImg ? 'stretch' : 'center',
                  gap: '12px',
                  padding: hasImg ? '12px' : '14px 18px',
                  borderRadius: '12px',
                  background: isSelected ? 'rgba(99, 102, 241, 0.2)' : 'rgba(15, 23, 42, 0.6)',
                  border: isSelected ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                  overflow: 'hidden'
                }}
              >
                {hasImg && (
                  <div style={{ position: 'relative', width: '100%', height: '130px', borderRadius: '8px', overflow: 'hidden', background: '#000' }}>
                    <img src={optionImg} alt={`Option ${optKey}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{
                      position: 'absolute', top: '6px', left: '6px', width: '26px', height: '26px', borderRadius: '50%',
                      background: isSelected ? 'var(--accent-primary)' : 'rgba(15, 23, 42, 0.85)', color: '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem'
                    }}>
                      {optKey}
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, width: '100%' }}>
                  {!hasImg && (
                    <div style={{
                      width: '28px',
                      height: '28px',
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
                      {optKey}
                    </div>
                  )}
                  <div style={{ flex: 1 }}>{optionText}</div>
                  {isSelected && <CheckCircle2 size={20} color="var(--accent-primary)" style={{ flexShrink: 0 }} />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation & Submit Controls */}
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
            onClick={handleSubmitQuiz}
            disabled={submitting}
            className="btn btn-primary"
            style={{ background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)' }}
          >
            {submitting ? 'Submitting...' : 'Submit Quiz Now'}
          </button>
        )}
      </div>
    </div>
  );
}
