import React from 'react';
import { Trophy, Clock, CheckCircle2, RotateCcw, BarChart3, Award, ArrowLeft } from 'lucide-react';
import LogoHeader from '../components/LogoHeader';

export default function QuizResult({ result, logoUrl, onRetakeQuiz, onViewLeaderboard, onBackToDashboard }) {
  const { score, totalQuestions, percentage, timeSpentSeconds } = result;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs} seconds`;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="glass-panel" style={{ maxWidth: '520px', margin: '0 auto', padding: '36px', textAlign: 'center' }}>
      {/* Logo Header */}
      <LogoHeader 
        title="Quiz Completed!" 
        subtitle="Great effort! Here is your performance breakdown:"
        logoUrl={logoUrl}
      />

      {/* Score Trophy Circle */}
      <div style={{
        width: '120px',
        height: '120px',
        borderRadius: '50%',
        margin: '0 auto 24px',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.2))',
        border: '2px solid var(--accent-primary)',
        boxShadow: '0 0 30px rgba(99, 102, 241, 0.3)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <span style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-main)' }}>{score}/{totalQuestions}</span>
        <span style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', fontWeight: 700 }}>{percentage}% Score</span>
      </div>

      {/* Statistics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '28px' }}>
        <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <Clock size={20} color="var(--accent-cyan)" style={{ marginBottom: '6px' }} />
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>Time Taken</div>
          <div style={{ fontSize: '1.05rem', fontWeight: 700 }}>{formatTime(timeSpentSeconds)}</div>
        </div>

        <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <Award size={20} color="var(--accent-amber)" style={{ marginBottom: '6px' }} />
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>Rank Status</div>
          <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--accent-amber)' }}>Recorded</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <button onClick={onViewLeaderboard} className="btn btn-primary" style={{ justifyContent: 'center', padding: '14px' }}>
          <BarChart3 size={18} /> View Public Leaderboard
        </button>
        <button onClick={onRetakeQuiz} className="btn btn-secondary" style={{ justifyContent: 'center' }}>
          <RotateCcw size={16} /> Retake Quiz
        </button>
        {onBackToDashboard && (
          <button onClick={onBackToDashboard} className="btn btn-secondary" style={{ justifyContent: 'center' }}>
            <ArrowLeft size={16} /> Back to User Dashboard
          </button>
        )}
      </div>
    </div>
  );
}
