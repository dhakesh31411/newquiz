import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Sparkles, 
  Clock, 
  Award, 
  Play, 
  Flame, 
  BarChart2, 
  History, 
  Filter, 
  CheckCircle2, 
  RotateCcw,
  LogOut,
  Tag
} from 'lucide-react';
import LogoHeader from '../components/LogoHeader';

export default function UserDashboard({ userSession, setUserSession, logoUrl, websiteName = 'QuizMaster', onStartQuiz, onViewLeaderboard }) {
  const [quizzes, setQuizzes] = useState([]);
  const [quizOfDay, setQuizOfDay] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      // Fetch Quizzes
      const qRes = await fetch('/api/quizzes');
      const qData = await qRes.json();
      if (qRes.ok && qData.success) {
        setQuizzes(qData.quizzes);
        setQuizOfDay(qData.quizOfDay);
      }

      // Fetch User Dashboard Stats & History
      const dRes = await fetch(`/api/users/${userSession.id}/dashboard`);
      const dData = await dRes.json();
      if (dRes.ok && dData.success) {
        setDashboardData(dData);
      }
    } catch (err) {}
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [userSession]);

  const categories = ['All', 'Movies', 'Technology', 'General Knowledge', 'Science'];
  const difficulties = ['All', 'Easy', 'Medium', 'Hard'];

  const filteredQuizzes = quizzes.filter(q => {
    const catMatch = selectedCategory === 'All' || q.category.toLowerCase() === selectedCategory.toLowerCase();
    const diffMatch = selectedDifficulty === 'All' || q.difficulty.toLowerCase() === selectedDifficulty.toLowerCase();
    return catMatch && diffMatch;
  });

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  if (loading) {
    return (
      <div className="glass-panel" style={{ maxWidth: '800px', margin: '40px auto', padding: '40px', textAlign: 'center' }}>
        <LogoHeader title="Loading Your Dashboard..." logoUrl={logoUrl} />
        <p style={{ color: 'var(--text-muted)' }}>Preparing your active quizzes and history...</p>
      </div>
    );
  }

  const stats = dashboardData?.stats || { totalAttempts: 0, completedQuizzes: 0, highestScore: 0, avgScorePct: 0, streakDays: 0 };
  const history = dashboardData?.history || [];
  const badges = dashboardData?.badges || [];

  const now = new Date();

  return (
    <div style={{ maxWidth: '1050px', margin: '0 auto' }}>
      {/* Welcome Banner Card */}
      <div className="glass-panel" style={{ 
        padding: '32px', 
        marginBottom: '28px', 
        display: 'flex', 
        justify: 'space-between', 
        alignItems: 'center', 
        flexWrap: 'wrap', 
        gap: '20px',
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(99, 102, 241, 0.15))'
      }}>
        <div>
          <span className="badge badge-indigo" style={{ marginBottom: '10px' }}>
            🔥 {stats.streakDays} Day Active Streak
          </span>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '6px' }}>
            Welcome, <span className="gradient-text">{userSession.name}</span>!
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Explore active & live quizzes below to test your knowledge on {websiteName}.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button onClick={onViewLeaderboard} className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>
            <Trophy size={16} color="var(--accent-amber)" /> View Leaderboard
          </button>
          <button onClick={() => setUserSession(null)} className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>

      {/* 🏆 QUIZ OF THE DAY SECTION */}
      {quizOfDay && (
        <div className="glass-panel" style={{ 
          padding: '28px 32px', 
          marginBottom: '32px', 
          border: '1px solid rgba(245, 158, 11, 0.4)',
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08), rgba(15, 23, 42, 0.7))',
          boxShadow: '0 0 25px rgba(245, 158, 11, 0.15)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-amber)', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '12px' }}>
            <Sparkles size={18} /> FEATURED QUIZ OF THE DAY
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', alignItems: 'center' }}>
            {/* Poster / Image */}
            <div style={{ width: '100%', height: '180px', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
              <img src={quizOfDay.image || '/logo.jpg'} alt={quizOfDay.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>

            {/* Quiz Info */}
            <div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <span className="badge badge-warning">{quizOfDay.category}</span>
                <span className="badge badge-indigo">{quizOfDay.difficulty}</span>
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '8px' }}>{quizOfDay.title}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>{quizOfDay.description}</p>

              <div style={{ display: 'flex', gap: '16px', fontSize: '0.85rem', color: 'var(--text-dim)', marginBottom: '20px' }}>
                <span>📋 {quizOfDay.total_questions} Questions</span>
                <span>⏱️ {Math.floor(quizOfDay.time_limit_seconds / 60)} Minutes</span>
              </div>

              <button onClick={() => onStartQuiz(quizOfDay.id)} className="btn btn-primary" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                <Play size={18} /> Start Quiz of the Day
              </button>
            </div>
          </div>
        </div>
      )}

      {/* USER STATISTICS & EARNED BADGES GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ color: 'var(--text-dim)', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px' }}>Quizzes Completed</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-primary)' }}>{stats.completedQuizzes}</div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ color: 'var(--text-dim)', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px' }}>Total Attempts</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-secondary)' }}>{stats.totalAttempts}</div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ color: 'var(--text-dim)', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px' }}>Highest Score</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>{stats.highestScore}</div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ color: 'var(--text-dim)', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px' }}>Average Accuracy</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>{stats.avgScorePct}%</div>
        </div>
      </div>

      {/* EARNED BADGES SECTION */}
      {badges.length > 0 && (
        <div className="glass-panel" style={{ padding: '20px 24px', marginBottom: '32px' }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '12px' }}>Earned Performance Badges</div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {badges.map(b => (
              <div key={b.id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 14px',
                borderRadius: '12px',
                background: 'rgba(99, 102, 241, 0.12)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                fontSize: '0.85rem',
                fontWeight: 600
              }}>
                <span>{b.icon}</span> {b.name}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 📚 AVAILABLE QUIZZES SECTION */}
      <div style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Available Quizzes</h3>

          {/* Category & Difficulty Filters */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <select 
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              style={{ padding: '8px 14px', background: 'rgba(30, 41, 59, 0.6)', border: '1px solid var(--border-color)', borderRadius: '10px', color: '#fff', fontSize: '0.85rem' }}
            >
              {categories.map(c => <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>)}
            </select>

            <select 
              value={selectedDifficulty}
              onChange={e => setSelectedDifficulty(e.target.value)}
              style={{ padding: '8px 14px', background: 'rgba(30, 41, 59, 0.6)', border: '1px solid var(--border-color)', borderRadius: '10px', color: '#fff', fontSize: '0.85rem' }}
            >
              {difficulties.map(d => <option key={d} value={d}>{d === 'All' ? 'All Difficulties' : d}</option>)}
            </select>
          </div>
        </div>

        {/* Quiz Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
          {filteredQuizzes.length === 0 ? (
            <div className="glass-panel" style={{ gridColumn: '1 / -1', padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No active quizzes available for the selected filters.
            </div>
          ) : (
            filteredQuizzes.map(q => {
              const userAttemptsForQuiz = history.filter(h => h.quiz_title === q.title).length;
              const isMaxReached = q.max_attempts && userAttemptsForQuiz >= q.max_attempts;

              // Schedule Status Check
              const isScheduled = q.is_scheduled === 1;
              const startTime = q.schedule_start_time ? new Date(q.schedule_start_time) : null;
              const endTime = q.schedule_end_time ? new Date(q.schedule_end_time) : null;

              let isNotStartedYet = false;
              let isEnded = false;

              if (isScheduled) {
                if (startTime && startTime > now) isNotStartedYet = true;
                if (endTime && endTime < now) isEnded = true;
              }

              const canStart = !isMaxReached && !isNotStartedYet && !isEnded;

              return (
                <div key={q.id} className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    {/* Image */}
                    <div style={{ width: '100%', height: '140px', borderRadius: '12px', overflow: 'hidden', marginBottom: '16px', border: '1px solid var(--border-color)' }}>
                      <img src={q.image || '/logo.jpg'} alt={q.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>

                    {/* Badges */}
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
                      <span className="badge badge-indigo">{q.category}</span>
                      <span className="badge badge-warning">{q.difficulty}</span>
                      {isScheduled && isNotStartedYet && (
                        <span className="badge badge-cyan">⏱️ Starts: {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      )}
                      {isScheduled && isEnded && (
                        <span className="badge badge-danger">🚫 Quiz Ended</span>
                      )}
                      {isScheduled && !isNotStartedYet && !isEnded && (
                        <span className="badge badge-success">🔴 Live Quiz</span>
                      )}
                    </div>

                    <h4 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>{q.title}</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px', height: '40px', overflow: 'hidden' }}>{q.description}</p>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
                      <span>📋 {q.total_questions} Questions</span>
                      <span>⏱️ {Math.floor(q.time_limit_seconds / 60)} Mins</span>
                    </div>

                    <button 
                      onClick={() => onStartQuiz(q.id)}
                      disabled={!canStart}
                      className={`btn ${!canStart ? 'btn-secondary' : 'btn-primary'}`}
                      style={{ width: '100%', justifyContent: 'center', opacity: !canStart ? 0.6 : 1 }}
                    >
                      {isNotStartedYet 
                        ? 'Not Started Yet' 
                        : isEnded 
                        ? 'Quiz Ended' 
                        : isMaxReached 
                        ? 'Max Attempts Completed' 
                        : userAttemptsForQuiz > 0 
                        ? 'Practice Again' 
                        : isScheduled 
                        ? 'Start Live Quiz' 
                        : 'Start Quiz'}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 📜 MY QUIZ HISTORY SECTION */}
      <div className="glass-panel" style={{ padding: '28px', marginBottom: '40px' }}>
        <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <History size={22} color="var(--accent-primary)" /> My Quiz History
        </h3>

        <div className="table-responsive" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '12px' }}>Quiz Title</th>
                <th style={{ padding: '12px' }}>Category</th>
                <th style={{ padding: '12px' }}>Attempt #</th>
                <th style={{ padding: '12px' }}>Score</th>
                <th style={{ padding: '12px' }}>Percentage</th>
                <th style={{ padding: '12px' }}>Time Taken</th>
                <th style={{ padding: '12px' }}>Leaderboard Status</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 ? (
                <tr><td colSpan="7" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>You haven't completed any quizzes yet. Start a quiz above!</td></tr>
              ) : (
                history.map(att => (
                  <tr key={att.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '12px', fontWeight: 600 }}>{att.quiz_title}</td>
                    <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{att.quiz_category}</td>
                    <td style={{ padding: '12px' }}>Attempt #{att.attempt_number}</td>
                    <td style={{ padding: '12px', fontWeight: 700, color: 'var(--accent-emerald)' }}>{att.score} / {att.total_questions}</td>
                    <td style={{ padding: '12px' }}>{att.percentage}%</td>
                    <td style={{ padding: '12px', fontFamily: 'monospace', color: 'var(--text-muted)' }}>{formatTime(att.time_spent_seconds)}</td>
                    <td style={{ padding: '12px' }}>
                      {att.leaderboard_status === 'Final Score' ? (
                        <span className="badge badge-success">🏆 Final Score</span>
                      ) : (
                        <span className="badge badge-indigo">Practice</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
