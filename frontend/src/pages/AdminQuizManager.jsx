import React, { useState, useEffect } from 'react';
import { 
  HelpCircle, 
  Clock, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  Image, 
  Sparkles,
  Trophy,
  CheckCircle,
  FileText
} from 'lucide-react';
import ImageCropModal from '../components/ImageCropModal';

export default function AdminQuizManager({ adminSession }) {
  const [subTab, setSubTab] = useState('quizzes'); // 'quizzes' | 'questions'

  // Quizzes State
  const [quizzes, setQuizzes] = useState([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(true);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [showAddQuizModal, setShowAddQuizModal] = useState(false);
  const [newQuiz, setNewQuiz] = useState({
    title: '',
    category: 'Movies',
    description: '',
    image: '/movie1.jpg',
    time_limit_seconds: 300,
    total_questions: 10,
    questions_per_player: 5,
    random_questions: 1,
    random_answers: 1,
    randomization_mode: 'random_questions_random_answers',
    difficulty: 'Medium',
    max_attempts: 3,
    is_active: 1,
    is_quiz_of_day: 0,
    is_scheduled: 0,
    schedule_start_time: '',
    schedule_end_time: ''
  });

  // Questions State
  const [questions, setQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [showAddQuestionModal, setShowAddQuestionModal] = useState(false);
  
  // AI Document Generator State
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiFile, setAiFile] = useState(null);
  const [aiNumQuestions, setAiNumQuestions] = useState(5);
  const [aiCustomNum, setAiCustomNum] = useState(10);
  const [aiDifficulty, setAiDifficulty] = useState('Mixed');
  const [aiTargetQuizId, setAiTargetQuizId] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiGeneratedList, setAiGeneratedList] = useState([]);
  const [aiSaving, setAiSaving] = useState(false);
  const [aiErrorMessage, setAiErrorMessage] = useState('');

  // Cover Image Cropper State
  const [showCropModal, setShowCropModal] = useState(false);
  const [cropSourceImg, setCropSourceImg] = useState('');
  const [cropZoom, setCropZoom] = useState(1.0);
  const [cropOffsetY, setCropOffsetY] = useState(0);
  const [cropOffsetX, setCropOffsetX] = useState(0);
  const [cropTarget, setCropTarget] = useState('new'); // 'new' | 'edit'

  const handleOpenCropper = (imageSrc, targetType) => {
    if (!imageSrc) return;
    setCropSourceImg(imageSrc);
    setCropTarget(targetType);
    setCropZoom(1.0);
    setCropOffsetY(0);
    setCropOffsetX(0);
    setShowCropModal(true);
  };

  const handleApplyCrop = () => {
    if (!cropSourceImg) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const targetW = 800;
      const targetH = 320; // 2.5:1 landscape banner ratio matching User Dashboard
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d');

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, targetW, targetH);

      const scaleToCover = Math.max(targetW / img.width, targetH / img.height);
      const drawWidth = img.width * scaleToCover * cropZoom;
      const drawHeight = img.height * scaleToCover * cropZoom;

      const baseDx = (targetW - drawWidth) / 2;
      const baseDy = (targetH - drawHeight) / 2;

      const finalDx = baseDx + (cropOffsetX / 100) * (drawWidth / 2);
      const finalDy = baseDy + (cropOffsetY / 100) * (drawHeight / 2);

      ctx.drawImage(img, finalDx, finalDy, drawWidth, drawHeight);

      const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.9);
      if (cropTarget === 'new') {
        setNewQuiz(prev => ({ ...prev, image: croppedDataUrl }));
      } else {
        setEditingQuiz(prev => ({ ...prev, image: croppedDataUrl }));
      }
      setShowCropModal(false);
    };
    img.onerror = () => {
      alert('Could not load image for cropping. Try uploading a local file or standard image URL.');
    };
    img.src = cropSourceImg;
  };

  // Handle Generate Questions from Document
  const handleGenerateQuestionsFromDoc = async (e) => {
    e.preventDefault();
    setAiErrorMessage('');
    if (!aiFile) {
      setAiErrorMessage('Please select a PDF, Word (.docx), or Text file.');
      return;
    }

    const finalCount = aiNumQuestions === 'custom' ? parseInt(aiCustomNum, 10) : parseInt(aiNumQuestions, 10);

    setAiGenerating(true);

    try {
      const formData = new FormData();
      formData.append('document', aiFile);
      formData.append('num_questions', finalCount);
      formData.append('difficulty', aiDifficulty);

      const res = await fetch('/api/admin/generate-questions-from-doc', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminSession.token}`
        },
        body: formData
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setAiGeneratedList(data.questions);
      } else {
        setAiErrorMessage(data.message || 'Failed to extract text or generate questions from document.');
      }
    } catch (err) {
      setAiErrorMessage('Connection error while generating AI questions.');
    } finally {
      setAiGenerating(false);
    }
  };

  // Batch Save AI Generated Questions to Quiz
  const handleBatchSaveAiQuestions = async () => {
    if (aiGeneratedList.length === 0) return;
    const quizId = aiTargetQuizId || (quizzes[0] ? quizzes[0].id : 1);

    setAiSaving(true);
    try {
      const res = await fetch('/api/admin/questions/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminSession.token}`
        },
        body: JSON.stringify({
          quiz_id: quizId,
          questions: aiGeneratedList
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        alert(`🎉 ${data.savedCount || aiGeneratedList.length} AI questions added to Question Bank!`);
        setShowAiModal(false);
        setAiGeneratedList([]);
        setAiFile(null);
        fetchQuestions();
        fetchQuizzes();
      } else {
        alert(data.message || 'Error saving questions.');
      }
    } catch (err) {
      alert('Error connecting to backend server.');
    } finally {
      setAiSaving(false);
    }
  };
  
  // Question Images State
  const [qImages, setQImages] = useState(['/movie1.jpg']);
  const [qUrlInput, setQUrlInput] = useState('');
  const [newQ, setNewQ] = useState({
    quiz_id: 1,
    category: 'Movies',
    type: 'image',
    question_text: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    option_a_image: '',
    option_b_image: '',
    option_c_image: '',
    option_d_image: '',
    correct_option: 'A',
    explanation: '',
    difficulty: 'Medium'
  });

  // Fetch Quizzes
  const fetchQuizzes = async () => {
    setLoadingQuizzes(true);
    try {
      const res = await fetch('/api/admin/quizzes', {
        headers: { 'Authorization': `Bearer ${adminSession.token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) setQuizzes(data.quizzes);
    } catch (err) {}
    finally { setLoadingQuizzes(false); }
  };

  // Fetch Questions
  const fetchQuestions = async () => {
    setLoadingQuestions(true);
    try {
      const res = await fetch('/api/admin/questions', {
        headers: { 'Authorization': `Bearer ${adminSession.token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) setQuestions(data.questions);
    } catch (err) {}
    finally { setLoadingQuestions(false); }
  };

  useEffect(() => {
    fetchQuizzes();
    fetchQuestions();
  }, []);

  // Multi-Image Upload & Reorder Handlers
  const handleAddImageFile = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setQImages(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddImageUrl = () => {
    if (qUrlInput.trim()) {
      setQImages(prev => [...prev, qUrlInput.trim()]);
      setQUrlInput('');
    }
  };

  const handleRemoveImage = (index) => {
    setQImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleMoveImage = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= qImages.length) return;
    const updated = [...qImages];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setQImages(updated);
  };

  // Create Quiz
  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/quizzes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminSession.token}`
        },
        body: JSON.stringify(newQuiz)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setShowAddQuizModal(false);
        fetchQuizzes();
      } else { alert(data.message || 'Error creating quiz.'); }
    } catch (err) { alert('Connection error.'); }
  };

  // Save Edit Quiz
  const handleSaveQuizEdit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/admin/quizzes/${editingQuiz.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminSession.token}`
        },
        body: JSON.stringify(editingQuiz)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setEditingQuiz(null);
        fetchQuizzes();
      }
    } catch (err) { alert('Error updating quiz.'); }
  };

  // Delete Quiz
  const handleDeleteQuiz = async (id) => {
    if (!window.confirm('Delete this quiz?')) return;
    try {
      await fetch(`/api/admin/quizzes/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${adminSession.token}` }
      });
      fetchQuizzes();
    } catch (err) {}
  };

  // Create Question
  const handleCreateQuestion = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...newQ,
        images: JSON.stringify(qImages),
        image: qImages[0] || '/movie1.jpg'
      };

      const res = await fetch('/api/admin/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminSession.token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setShowAddQuestionModal(false);
        setQImages(['/movie1.jpg']);
        setNewQ({ quiz_id: 1, category: 'Movies', type: 'image', question_text: '', option_a: '', option_b: '', option_c: '', option_d: '', option_a_image: '', option_b_image: '', option_c_image: '', option_d_image: '', correct_option: 'A', explanation: '', difficulty: 'Medium' });
        fetchQuestions();
      }
    } catch (err) { alert('Error adding question.'); }
  };

  // Open Edit Question Modal
  const handleOpenEditQuestion = (q) => {
    setEditingQuestion(q);
    const parsedImages = q.images && Array.isArray(q.images) && q.images.length > 0
      ? q.images
      : (q.image ? [q.image] : ['/movie1.jpg']);
    setQImages(parsedImages);
  };

  // Save Edit Question
  const handleSaveQuestionEdit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...editingQuestion,
        images: JSON.stringify(qImages),
        image: qImages[0] || '/movie1.jpg'
      };

      const res = await fetch(`/api/admin/questions/${editingQuestion.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminSession.token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setEditingQuestion(null);
        setQImages(['/movie1.jpg']);
        fetchQuestions();
      }
    } catch (err) { alert('Error updating question.'); }
  };

  // Delete Question
  const handleDeleteQuestion = async (id) => {
    if (!window.confirm('Delete this question?')) return;
    try {
      await fetch(`/api/admin/questions/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${adminSession.token}` }
      });
      fetchQuestions();
    } catch (err) {}
  };

  return (
    <div className="glass-panel" style={{ padding: '28px', marginBottom: '28px' }}>
      {/* Sub Navigation Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
        <button onClick={() => setSubTab('quizzes')} className={`btn ${subTab === 'quizzes' ? 'btn-primary' : 'btn-secondary'}`} style={{ fontSize: '0.85rem' }}>
          <Trophy size={16} /> Manage Quizzes ({quizzes.length})
        </button>

        <button onClick={() => setSubTab('questions')} className={`btn ${subTab === 'questions' ? 'btn-primary' : 'btn-secondary'}`} style={{ fontSize: '0.85rem' }}>
          <HelpCircle size={16} /> Multi-Photo & MCQ Questions ({questions.length})
        </button>
      </div>

      {/* -------------------------------------------------- */}
      {/* TAB 1: QUIZZES MANAGER */}
      {/* -------------------------------------------------- */}
      {subTab === 'quizzes' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Active & Scheduled Quiz List</h3>
            <button onClick={() => setShowAddQuizModal(true)} className="btn btn-primary" style={{ fontSize: '0.85rem' }}>
              <Plus size={16} /> Create New Quiz
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {quizzes.map(q => (
              <div key={q.id} style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '18px', borderRadius: '14px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ width: '100%', height: '110px', borderRadius: '10px', overflow: 'hidden', marginBottom: '12px' }}>
                    <img src={q.image || '/logo.jpg'} alt={q.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '8px', flexWrap: 'wrap' }}>
                    <span className="badge badge-indigo">{q.category}</span>
                    <span className="badge badge-warning">{q.difficulty}</span>
                    {q.is_quiz_of_day ? <span className="badge badge-success">⭐ Quiz of Day</span> : null}
                    {q.is_scheduled ? <span className="badge badge-cyan">⏱️ Live Scheduled</span> : null}
                    <span className="badge badge-purple">🔀 {q.randomization_mode === 'same_questions_same_order' ? 'Fixed Qs & Order' : q.randomization_mode === 'same_questions_random_order' ? 'Same Qs, Random Order' : q.randomization_mode === 'random_questions_random_order' ? 'Random Qs & Order' : 'Random Qs + Answers'}</span>
                  </div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px' }}>{q.title}</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '12px' }}>{q.description}</p>
                </div>

                <div style={{ paddingTop: '12px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>⏱️ {Math.floor(q.time_limit_seconds/60)}m | 🎯 {q.questions_per_player || q.total_questions}/{q.total_questions} Qs</span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={() => setEditingQuiz(q)} className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem' }}><Edit3 size={12} /></button>
                    <button onClick={() => handleDeleteQuiz(q.id)} className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem', color: 'var(--accent-rose)' }}><Trash2 size={12} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add Quiz Modal */}
          {showAddQuizModal && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
              <div className="glass-panel" style={{ width: '100%', maxWidth: '520px', padding: '28px', background: '#1e293b', maxHeight: '90vh', overflowY: 'auto' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '16px' }}>Create New Quiz</h3>
                <form onSubmit={handleCreateQuiz} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <input required type="text" placeholder="Quiz Title" value={newQuiz.title} onChange={e => setNewQuiz({...newQuiz, title: e.target.value})} style={{ padding: '10px', background: 'rgba(15,23,42,0.8)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff' }} />
                  
                  <select value={newQuiz.category} onChange={e => setNewQuiz({...newQuiz, category: e.target.value})} style={{ padding: '10px', background: 'rgba(15,23,42,0.8)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff' }}>
                    <option value="Movies">Movies 🎬</option>
                    <option value="Technology">Technology 💻</option>
                    <option value="General Knowledge">General Knowledge 🌍</option>
                    <option value="Science">Science 🔬</option>
                  </select>

                  <textarea placeholder="Description" value={newQuiz.description} onChange={e => setNewQuiz({...newQuiz, description: e.target.value})} style={{ padding: '10px', background: 'rgba(15,23,42,0.8)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff' }} />
                  {/* Cover Picture Upload & Preview */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px', color: 'var(--text-muted)' }}>
                      Quiz Cover Picture / Banner
                    </label>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
                        <div style={{ width: '90px', height: '60px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)', flexShrink: 0 }}>
                          <img 
                            src={newQuiz.image || '/logo.jpg'} 
                            alt="Cover Preview" 
                            onError={(e) => { e.target.src = '/logo.jpg'; }}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                          />
                        </div>
                        <button 
                          type="button"
                          onClick={() => handleOpenCropper(newQuiz.image || '/logo.jpg', 'new')}
                          className="btn btn-secondary" 
                          style={{ padding: '2px 6px', fontSize: '0.68rem', gap: '4px' }}
                        >
                          ✂️ Crop
                        </button>
                      </div>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setNewQuiz({ ...newQuiz, image: reader.result });
                                handleOpenCropper(reader.result, 'new');
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }} 
                        />
                        <input 
                          type="text" 
                          placeholder="Or Image URL (e.g. /movie1.jpg)" 
                          value={newQuiz.image} 
                          onChange={e => setNewQuiz({...newQuiz, image: e.target.value})} 
                          style={{ padding: '8px', background: 'rgba(15,23,42,0.8)', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff', fontSize: '0.8rem' }} 
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Timer (Seconds)</label>
                      <input type="number" value={newQuiz.time_limit_seconds} onChange={e => setNewQuiz({...newQuiz, time_limit_seconds: parseInt(e.target.value, 10)})} style={{ width: '100%', padding: '8px', background: 'rgba(15,23,42,0.8)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Question Bank Pool</label>
                      <input type="number" value={newQuiz.total_questions} onChange={e => setNewQuiz({...newQuiz, total_questions: parseInt(e.target.value, 10)})} style={{ width: '100%', padding: '8px', background: 'rgba(15,23,42,0.8)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff' }} />
                    </div>
                  </div>

                  {/* 🔀 LIVE QUIZ & RANDOMIZATION SETTINGS CARD */}
                  <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      🔀 Live Quiz & Randomization Mode
                    </label>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <div>
                        <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Questions Per Player</label>
                        <input 
                          type="number" 
                          value={newQuiz.questions_per_player} 
                          onChange={e => setNewQuiz({...newQuiz, questions_per_player: parseInt(e.target.value, 10)})} 
                          style={{ width: '100%', padding: '6px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff', fontSize: '0.8rem' }} 
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Max Attempts</label>
                        <input 
                          type="number" 
                          value={newQuiz.max_attempts} 
                          onChange={e => setNewQuiz({...newQuiz, max_attempts: parseInt(e.target.value, 10)})} 
                          style={{ width: '100%', padding: '6px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff', fontSize: '0.8rem' }} 
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Randomization Mode</label>
                      <select 
                        value={newQuiz.randomization_mode} 
                        onChange={e => {
                          const val = e.target.value;
                          const randQ = val.includes('random_questions') ? 1 : 0;
                          const randA = val.includes('random_answers') ? 1 : 0;
                          setNewQuiz({...newQuiz, randomization_mode: val, random_questions: randQ, random_answers: randA});
                        }} 
                        style={{ width: '100%', padding: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff', fontSize: '0.8rem' }}
                      >
                        <option value="same_questions_same_order">Same questions, fixed order for all players</option>
                        <option value="same_questions_random_order">Same questions, random order per player</option>
                        <option value="random_questions_random_order">Random questions + random order per player</option>
                        <option value="random_questions_random_answers">Random questions + random order + random answer choices</option>
                      </select>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.75rem', marginTop: '4px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
                        <input type="checkbox" checked={!!newQuiz.random_questions} onChange={e => setNewQuiz({...newQuiz, random_questions: e.target.checked ? 1 : 0})} />
                        ☑ Random Questions
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
                        <input type="checkbox" checked={!!newQuiz.random_answers} onChange={e => setNewQuiz({...newQuiz, random_answers: e.target.checked ? 1 : 0})} />
                        ☑ Random Answer Choices
                      </label>
                    </div>
                  </div>

                  {/* Scheduled Live Quiz Options */}
                  <div style={{ background: 'rgba(15,23,42,0.5)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <input type="checkbox" checked={!!newQuiz.is_scheduled} onChange={e => setNewQuiz({...newQuiz, is_scheduled: e.target.checked ? 1 : 0})} />
                      ⏱️ Schedule Live Quiz Window
                    </label>

                    {newQuiz.is_scheduled === 1 && (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '8px' }}>
                        <div>
                          <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Start Time</label>
                          <input type="datetime-local" value={newQuiz.schedule_start_time} onChange={e => setNewQuiz({...newQuiz, schedule_start_time: e.target.value})} style={{ width: '100%', padding: '6px', background: 'rgba(15,23,42,0.8)', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff', fontSize: '0.75rem' }} />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>End Time</label>
                          <input type="datetime-local" value={newQuiz.schedule_end_time} onChange={e => setNewQuiz({...newQuiz, schedule_end_time: e.target.value})} style={{ width: '100%', padding: '6px', background: 'rgba(15,23,42,0.8)', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff', fontSize: '0.75rem' }} />
                        </div>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      <input type="checkbox" checked={!!newQuiz.is_quiz_of_day} onChange={e => setNewQuiz({...newQuiz, is_quiz_of_day: e.target.checked ? 1 : 0})} /> ⭐ Set as Quiz of the Day
                    </label>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                    <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Create Quiz</button>
                    <button type="button" onClick={() => setShowAddQuizModal(false)} className="btn btn-secondary">Cancel</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Edit Quiz Modal */}
          {editingQuiz && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
              <div className="glass-panel" style={{ width: '100%', maxWidth: '520px', padding: '28px', background: '#1e293b', maxHeight: '90vh', overflowY: 'auto' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '16px' }}>Edit Quiz: {editingQuiz.title}</h3>
                <form onSubmit={handleSaveQuizEdit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <input required type="text" placeholder="Quiz Title" value={editingQuiz.title} onChange={e => setEditingQuiz({...editingQuiz, title: e.target.value})} style={{ padding: '10px', background: 'rgba(15,23,42,0.8)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff' }} />
                  
                  <select value={editingQuiz.category} onChange={e => setEditingQuiz({...editingQuiz, category: e.target.value})} style={{ padding: '10px', background: 'rgba(15,23,42,0.8)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff' }}>
                    <option value="Movies">Movies 🎬</option>
                    <option value="Technology">Technology 💻</option>
                    <option value="General Knowledge">General Knowledge 🌍</option>
                    <option value="Science">Science 🔬</option>
                  </select>

                  <textarea placeholder="Description" value={editingQuiz.description} onChange={e => setEditingQuiz({...editingQuiz, description: e.target.value})} style={{ padding: '10px', background: 'rgba(15,23,42,0.8)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff' }} />
                  
                  {/* Cover Picture Upload & Preview for Edit */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px', color: 'var(--text-muted)' }}>
                      Quiz Cover Picture / Banner (Upload from Device or URL)
                    </label>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
                        <div style={{ width: '90px', height: '60px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)', flexShrink: 0 }}>
                          <img 
                            src={editingQuiz.image || '/logo.jpg'} 
                            alt="Cover Preview" 
                            onError={(e) => { e.target.src = '/logo.jpg'; }}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                          />
                        </div>
                        <button 
                          type="button"
                          onClick={() => handleOpenCropper(editingQuiz.image || '/logo.jpg', 'edit')}
                          className="btn btn-secondary" 
                          style={{ padding: '2px 6px', fontSize: '0.68rem', gap: '4px' }}
                        >
                          ✂️ Crop
                        </button>
                      </div>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setEditingQuiz({ ...editingQuiz, image: reader.result });
                                handleOpenCropper(reader.result, 'edit');
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }} 
                        />
                        <input 
                          type="text" 
                          placeholder="Or Image URL (e.g. /movie1.jpg)" 
                          value={editingQuiz.image || ''} 
                          onChange={e => setEditingQuiz({...editingQuiz, image: e.target.value})} 
                          style={{ padding: '8px', background: 'rgba(15,23,42,0.8)', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff', fontSize: '0.8rem' }} 
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Timer (Seconds)</label>
                      <input type="number" value={editingQuiz.time_limit_seconds || 300} onChange={e => setEditingQuiz({...editingQuiz, time_limit_seconds: parseInt(e.target.value, 10)})} style={{ width: '100%', padding: '8px', background: 'rgba(15,23,42,0.8)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Question Bank Pool</label>
                      <input type="number" value={editingQuiz.total_questions || 10} onChange={e => setEditingQuiz({...editingQuiz, total_questions: parseInt(e.target.value, 10)})} style={{ width: '100%', padding: '8px', background: 'rgba(15,23,42,0.8)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff' }} />
                    </div>
                  </div>

                  {/* 🔀 LIVE QUIZ & RANDOMIZATION SETTINGS CARD */}
                  <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      🔀 Live Quiz & Randomization Mode
                    </label>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <div>
                        <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Questions Per Player</label>
                        <input 
                          type="number" 
                          value={editingQuiz.questions_per_player || 5} 
                          onChange={e => setEditingQuiz({...editingQuiz, questions_per_player: parseInt(e.target.value, 10)})} 
                          style={{ width: '100%', padding: '6px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff', fontSize: '0.8rem' }} 
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Max Attempts</label>
                        <input 
                          type="number" 
                          value={editingQuiz.max_attempts || 3} 
                          onChange={e => setEditingQuiz({...editingQuiz, max_attempts: parseInt(e.target.value, 10)})} 
                          style={{ width: '100%', padding: '6px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff', fontSize: '0.8rem' }} 
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Randomization Mode</label>
                      <select 
                        value={editingQuiz.randomization_mode || 'random_questions_random_answers'} 
                        onChange={e => {
                          const val = e.target.value;
                          const randQ = val.includes('random_questions') ? 1 : 0;
                          const randA = val.includes('random_answers') ? 1 : 0;
                          setEditingQuiz({...editingQuiz, randomization_mode: val, random_questions: randQ, random_answers: randA});
                        }} 
                        style={{ width: '100%', padding: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff', fontSize: '0.8rem' }}
                      >
                        <option value="same_questions_same_order">Same questions, fixed order for all players</option>
                        <option value="same_questions_random_order">Same questions, random order per player</option>
                        <option value="random_questions_random_order">Random questions + random order per player</option>
                        <option value="random_questions_random_answers">Random questions + random order + random answer choices</option>
                      </select>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.75rem', marginTop: '4px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
                        <input type="checkbox" checked={!!editingQuiz.random_questions} onChange={e => setEditingQuiz({...editingQuiz, random_questions: e.target.checked ? 1 : 0})} />
                        ☑ Random Questions
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
                        <input type="checkbox" checked={!!editingQuiz.random_answers} onChange={e => setEditingQuiz({...editingQuiz, random_answers: e.target.checked ? 1 : 0})} />
                        ☑ Random Answer Choices
                      </label>
                    </div>
                  </div>

                  {/* Scheduled Live Quiz Options */}
                  <div style={{ background: 'rgba(15,23,42,0.5)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <input type="checkbox" checked={!!editingQuiz.is_scheduled} onChange={e => setEditingQuiz({...editingQuiz, is_scheduled: e.target.checked ? 1 : 0})} />
                      ⏱️ Schedule Live Quiz Window
                    </label>

                    {editingQuiz.is_scheduled === 1 && (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '8px' }}>
                        <div>
                          <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Start Time</label>
                          <input type="datetime-local" value={editingQuiz.schedule_start_time || ''} onChange={e => setEditingQuiz({...editingQuiz, schedule_start_time: e.target.value})} style={{ width: '100%', padding: '6px', background: 'rgba(15,23,42,0.8)', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff', fontSize: '0.75rem' }} />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>End Time</label>
                          <input type="datetime-local" value={editingQuiz.schedule_end_time || ''} onChange={e => setEditingQuiz({...editingQuiz, schedule_end_time: e.target.value})} style={{ width: '100%', padding: '6px', background: 'rgba(15,23,42,0.8)', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff', fontSize: '0.75rem' }} />
                        </div>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      <input type="checkbox" checked={!!editingQuiz.is_quiz_of_day} onChange={e => setEditingQuiz({...editingQuiz, is_quiz_of_day: e.target.checked ? 1 : 0})} /> ⭐ Set as Quiz of the Day
                    </label>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                    <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Save Quiz Changes</button>
                    <button type="button" onClick={() => setEditingQuiz(null)} className="btn btn-secondary">Cancel</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* -------------------------------------------------- */}
      {/* TAB 2: MULTI-PHOTO & MCQ QUESTIONS MANAGER */}
      {/* -------------------------------------------------- */}
      {subTab === 'questions' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Question Bank</h3>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button 
                onClick={() => setShowAiModal(true)} 
                className="btn btn-primary" 
                style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', fontSize: '0.85rem' }}
              >
                <Sparkles size={16} /> Auto Generate Questions (AI)
              </button>
              <button onClick={() => { setQImages(['/movie1.jpg']); setShowAddQuestionModal(true); }} className="btn btn-primary" style={{ fontSize: '0.85rem' }}>
                <Plus size={16} /> Add Multi-Photo Question
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {questions.map((q, idx) => {
              const displayImages = q.images && Array.isArray(q.images) && q.images.length > 0 
                ? q.images 
                : (q.image ? [q.image] : []);

              return (
                <div key={q.id} style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '18px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    {/* Multi-Photo Display with + Separator */}
                    {displayImages.length > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        {displayImages.map((imgUrl, imgIdx) => (
                          <React.Fragment key={imgIdx}>
                            <div style={{ width: '90px', height: '65px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                              <img src={imgUrl} alt={`Frame ${imgIdx+1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                            {imgIdx < displayImages.length - 1 && (
                              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-primary)' }}>+</span>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    )}

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <h4 style={{ fontSize: '0.98rem', fontWeight: 700 }}>{idx + 1}. {q.question_text}</h4>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button onClick={() => handleOpenEditQuestion(q)} className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem' }}><Edit3 size={12} /></button>
                          <button onClick={() => handleDeleteQuestion(q.id)} className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem', color: 'var(--accent-rose)' }}><Trash2 size={12} /></button>
                        </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '10px' }}>
                        {['a', 'b', 'c', 'd'].map(optKey => {
                          const upperKey = optKey.toUpperCase();
                          const text = q[`option_${optKey}`];
                          const img = q[`option_${optKey}_image`];
                          const isCorrect = q.correct_option === upperKey;

                          return (
                            <div key={optKey} style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '8px', 
                              padding: '6px 10px', 
                              background: 'rgba(0,0,0,0.3)', 
                              borderRadius: '8px',
                              border: isCorrect ? '1px solid var(--accent-emerald)' : '1px solid transparent',
                              color: isCorrect ? 'var(--accent-emerald)' : 'inherit'
                            }}>
                              {img && (
                                <img src={img} alt={`Option ${upperKey}`} style={{ width: '36px', height: '36px', objectFit: 'cover', borderRadius: '4px' }} />
                              )}
                              <span style={{ fontWeight: isCorrect ? 700 : 400 }}>
                                {upperKey}. {text} {img ? '📷' : ''}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add / Edit Question Modal */}
          {(showAddQuestionModal || editingQuestion) && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
              <div className="glass-panel" style={{ width: '100%', maxWidth: '600px', padding: '28px', background: '#1e293b', maxHeight: '90vh', overflowY: 'auto' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '16px' }}>
                  {editingQuestion ? 'Edit Question' : 'Add Multi-Photo Question'}
                </h3>
                
                <form onSubmit={editingQuestion ? handleSaveQuestionEdit : handleCreateQuestion} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <select 
                    value={editingQuestion ? editingQuestion.quiz_id : newQ.quiz_id} 
                    onChange={e => {
                      const idVal = parseInt(e.target.value, 10);
                      if (editingQuestion) setEditingQuestion({...editingQuestion, quiz_id: idVal});
                      else setNewQ({...newQ, quiz_id: idVal});
                    }} 
                    style={{ padding: '8px', background: 'rgba(15,23,42,0.8)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff' }}
                  >
                    {quizzes.map(qz => <option key={qz.id} value={qz.id}>{qz.title}</option>)}
                  </select>

                  <input 
                    required 
                    type="text" 
                    placeholder="Question Text (e.g. Identify movie from photo sequence)" 
                    value={editingQuestion ? editingQuestion.question_text : newQ.question_text} 
                    onChange={e => {
                      const val = e.target.value;
                      if (editingQuestion) setEditingQuestion({...editingQuestion, question_text: val});
                      else setNewQ({...newQ, question_text: val});
                    }} 
                    style={{ padding: '8px', background: 'rgba(15,23,42,0.8)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff' }} 
                  />
                  
                  {/* MULTI-PHOTO MANAGER SECTION */}
                  <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: '8px' }}>
                      📸 Question Movie Photos ({qImages.length} attached)
                    </label>

                    {/* Thumbnail Previews with Reorder & Remove Controls */}
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '12px' }}>
                      {qImages.map((img, i) => (
                        <div key={i} style={{ position: 'relative', width: '100px', background: 'rgba(0,0,0,0.4)', borderRadius: '8px', padding: '4px', border: '1px solid var(--border-color)' }}>
                          <img src={img} alt={`Frame ${i+1}`} style={{ width: '100%', height: '60px', objectFit: 'cover', borderRadius: '6px' }} />
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                            <button type="button" onClick={() => handleMoveImage(i, -1)} disabled={i === 0} style={{ padding: '2px 4px', fontSize: '0.65rem', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', borderRadius: '4px' }}>←</button>
                            <button type="button" onClick={() => handleRemoveImage(i)} style={{ padding: '2px 4px', fontSize: '0.65rem', background: 'rgba(244,63,94,0.3)', border: 'none', color: 'var(--accent-rose)', borderRadius: '4px' }}>✕</button>
                            <button type="button" onClick={() => handleMoveImage(i, 1)} disabled={i === qImages.length - 1} style={{ padding: '2px 4px', fontSize: '0.65rem', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', borderRadius: '4px' }}>→</button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Upload File or Add URL Inputs */}
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <input 
                        type="file" 
                        accept="image/*" 
                        multiple 
                        onChange={handleAddImageFile} 
                        style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }} 
                      />
                      <div style={{ display: 'flex', gap: '6px', flex: 1, minWidth: '200px' }}>
                        <input 
                          type="text" 
                          placeholder="Or paste photo URL" 
                          value={qUrlInput} 
                          onChange={e => setQUrlInput(e.target.value)} 
                          style={{ flex: 1, padding: '6px', fontSize: '0.8rem', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff' }} 
                        />
                        <button type="button" onClick={handleAddImageUrl} className="btn btn-secondary" style={{ padding: '6px 10px', fontSize: '0.75rem' }}>Add</button>
                      </div>
                    </div>
                  </div>

                  {/* ANSWER OPTIONS & PHOTOS SECTION */}
                  <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: '10px' }}>
                      🖼️ Answer Options & Photos (A, B, C, D)
                    </label>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {['a', 'b', 'c', 'd'].map(optKey => {
                        const upperKey = optKey.toUpperCase();
                        const textVal = editingQuestion ? (editingQuestion[`option_${optKey}`] || '') : (newQ[`option_${optKey}`] || '');
                        const imgVal = editingQuestion ? (editingQuestion[`option_${optKey}_image`] || '') : (newQ[`option_${optKey}_image`] || '');

                        const updateField = (field, val) => {
                          if (editingQuestion) setEditingQuestion({ ...editingQuestion, [field]: val });
                          else setNewQ({ ...newQ, [field]: val });
                        };

                        const handleFileUpload = (e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => updateField(`option_${optKey}_image`, reader.result);
                            reader.readAsDataURL(file);
                          }
                        };

                        return (
                          <div key={optKey} style={{ background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px' }}>
                              <span style={{ fontWeight: 700, color: 'var(--accent-primary)', minWidth: '70px', fontSize: '0.85rem' }}>Option {upperKey}:</span>
                              <input 
                                required 
                                type="text" 
                                placeholder={`Option ${upperKey} Text`} 
                                value={textVal} 
                                onChange={e => updateField(`option_${optKey}`, e.target.value)} 
                                style={{ flex: 1, padding: '6px 10px', background: 'rgba(15,23,42,0.8)', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff', fontSize: '0.85rem' }} 
                              />
                            </div>

                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', paddingLeft: '78px' }}>
                              {imgVal && (
                                <div style={{ position: 'relative', width: '42px', height: '42px', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--accent-primary)' }}>
                                  <img src={imgVal} alt={`Option ${upperKey}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                  <button type="button" onClick={() => updateField(`option_${optKey}_image`, '')} style={{ position: 'absolute', top: 0, right: 0, background: 'rgba(244,63,94,0.8)', border: 'none', color: '#fff', fontSize: '0.6rem', padding: '1px 3px', cursor: 'pointer' }}>✕</button>
                                </div>
                              )}
                              
                              <input 
                                type="file" 
                                accept="image/*" 
                                onChange={handleFileUpload} 
                                style={{ fontSize: '0.7rem', color: 'var(--text-muted)', flex: '1 1 140px' }} 
                              />

                              <input 
                                type="text" 
                                placeholder={`Option ${upperKey} Image URL`} 
                                value={imgVal} 
                                onChange={e => updateField(`option_${optKey}_image`, e.target.value)} 
                                style={{ flex: '2 1 180px', padding: '5px 8px', fontSize: '0.75rem', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff' }} 
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <select value={editingQuestion ? editingQuestion.correct_option : newQ.correct_option} onChange={e => editingQuestion ? setEditingQuestion({...editingQuestion, correct_option: e.target.value}) : setNewQ({...newQ, correct_option: e.target.value})} style={{ padding: '8px', background: 'rgba(15,23,42,0.8)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff' }}>
                    <option value="A">Correct Option: A</option>
                    <option value="B">Correct Option: B</option>
                    <option value="C">Correct Option: C</option>
                    <option value="D">Correct Option: D</option>
                  </select>

                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Save Question</button>
                    <button type="button" onClick={() => { setShowAddQuestionModal(false); setEditingQuestion(null); }} className="btn btn-secondary">Cancel</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ✨ AI AUTO GENERATE QUESTIONS MODAL */}
          {showAiModal && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '20px' }}>
              <div className="glass-panel" style={{ width: '100%', maxWidth: aiGeneratedList.length > 0 ? '780px' : '560px', padding: '28px', background: '#1e293b', maxHeight: '90vh', overflowY: 'auto', border: '1px solid rgba(139, 92, 246, 0.4)', boxShadow: '0 0 40px rgba(139, 92, 246, 0.2)' }}>
                
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', padding: '10px', borderRadius: '12px', color: '#fff' }}>
                      <Sparkles size={22} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Auto Generate Questions (AI)</h3>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Upload a PDF, Word, or Text document to extract & generate quiz MCQs instantly.</p>
                    </div>
                  </div>
                  <button onClick={() => { setShowAiModal(false); setAiGeneratedList([]); setAiFile(null); }} className="btn btn-secondary" style={{ padding: '6px 10px' }}>✕</button>
                </div>

                {aiErrorMessage && (
                  <div style={{ padding: '10px 14px', background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.3)', color: 'var(--accent-rose)', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '16px' }}>
                    ⚠️ {aiErrorMessage}
                  </div>
                )}

                {/* STEP 1: FILE UPLOAD & CONFIGURATION FORM */}
                {aiGeneratedList.length === 0 ? (
                  <form onSubmit={handleGenerateQuestionsFromDoc} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* Target Quiz Selector */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>
                        Select Target Quiz
                      </label>
                      <select 
                        value={aiTargetQuizId || (quizzes[0]?.id || '')} 
                        onChange={e => setAiTargetQuizId(e.target.value)}
                        style={{ width: '100%', padding: '10px', background: 'rgba(15,23,42,0.8)', border: '1px solid var(--border-color)', borderRadius: '10px', color: '#fff', fontSize: '0.9rem' }}
                      >
                        {quizzes.map(qz => (
                          <option key={qz.id} value={qz.id}>{qz.title} ({qz.category})</option>
                        ))}
                      </select>
                    </div>

                    {/* Document File Upload Zone */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>
                        Upload Document File (.pdf, .docx, .doc, .txt)
                      </label>
                      <div style={{
                        border: '2px dashed var(--accent-primary)',
                        borderRadius: '14px',
                        padding: '24px',
                        textAlign: 'center',
                        background: 'rgba(99, 102, 241, 0.05)',
                        cursor: 'pointer',
                        position: 'relative'
                      }}>
                        <input 
                          type="file" 
                          accept=".pdf,.docx,.doc,.txt,.md"
                          onChange={e => {
                            const f = e.target.files[0];
                            if (f) setAiFile(f);
                          }}
                          style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%' }}
                        />
                        <FileText size={36} color="var(--accent-primary)" style={{ margin: '0 auto 10px' }} />
                        {aiFile ? (
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--accent-emerald)', fontSize: '0.95rem' }}>📄 Selected: {aiFile.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{(aiFile.size / 1024).toFixed(1)} KB &bull; Click to change file</div>
                          </div>
                        ) : (
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '4px' }}>Drop PDF or Word document here or click to browse</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Supports PDF (.pdf), Word (.docx), and Text (.txt) up to 20MB</div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Number of Questions Selector */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>
                        Number of Questions to Generate
                      </label>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {[5, 10, 20, 30, 'custom'].map(val => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setAiNumQuestions(val)}
                            className={`btn ${aiNumQuestions === val ? 'btn-primary' : 'btn-secondary'}`}
                            style={{ fontSize: '0.82rem', padding: '8px 14px' }}
                          >
                            {val === 'custom' ? 'Custom' : `${val} Questions`}
                          </button>
                        ))}
                      </div>

                      {aiNumQuestions === 'custom' && (
                        <input 
                          type="number" 
                          min="1" 
                          max="50" 
                          placeholder="Enter custom count (e.g. 15)"
                          value={aiCustomNum}
                          onChange={e => setAiCustomNum(e.target.value)}
                          style={{ width: '100%', marginTop: '8px', padding: '8px 12px', background: 'rgba(15,23,42,0.8)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff', fontSize: '0.85rem' }}
                        />
                      )}
                    </div>

                    {/* Difficulty Level Selector */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>
                        Difficulty Level
                      </label>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {['Easy', 'Medium', 'Hard', 'Mixed'].map(diff => (
                          <button
                            key={diff}
                            type="button"
                            onClick={() => setAiDifficulty(diff)}
                            className={`btn ${aiDifficulty === diff ? 'btn-primary' : 'btn-secondary'}`}
                            style={{ fontSize: '0.82rem', padding: '8px 14px' }}
                          >
                            {diff}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                      <button 
                        type="submit" 
                        disabled={aiGenerating} 
                        className="btn btn-primary" 
                        style={{ flex: 1, justifyContent: 'center', background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', padding: '12px' }}
                      >
                        {aiGenerating ? '🤖 Extracting Text & Generating Questions...' : '✨ Generate AI Questions'}
                      </button>
                      <button type="button" onClick={() => setShowAiModal(false)} className="btn btn-secondary">Cancel</button>
                    </div>
                  </form>
                ) : (
                  /* STEP 2: PREVIEW & INTERACTIVE EDITING SCREEN */
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                      <div>
                        <span className="badge badge-indigo">✨ {aiGeneratedList.length} Questions Generated</span>
                        <span className="badge badge-warning" style={{ marginLeft: '8px' }}>Target: {quizzes.find(q => q.id == (aiTargetQuizId || quizzes[0]?.id))?.title}</span>
                      </div>
                      <button 
                        onClick={() => setAiGeneratedList([])} 
                        className="btn btn-secondary" 
                        style={{ fontSize: '0.78rem' }}
                      >
                        🔄 Regenerate / Upload Another
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '50vh', overflowY: 'auto', paddingRight: '6px', marginBottom: '20px' }}>
                      {aiGeneratedList.map((q, idx) => (
                        <div key={q.id || idx} style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px', gap: '10px' }}>
                            <div style={{ fontWeight: 700, color: 'var(--accent-primary)', fontSize: '0.85rem' }}>Question #{idx + 1}</div>
                            <button 
                              onClick={() => {
                                setAiGeneratedList(prev => prev.filter((_, i) => i !== idx));
                              }}
                              className="btn btn-secondary"
                              style={{ padding: '4px 8px', fontSize: '0.72rem', color: 'var(--accent-rose)' }}
                              title="Remove Question"
                            >
                              <Trash2 size={12} /> Remove
                            </button>
                          </div>

                          {/* Editable Question Text */}
                          <textarea 
                            value={q.question_text}
                            onChange={e => {
                              const val = e.target.value;
                              setAiGeneratedList(prev => prev.map((item, i) => i === idx ? { ...item, question_text: val } : item));
                            }}
                            rows={2}
                            style={{ width: '100%', padding: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff', fontSize: '0.9rem', marginBottom: '10px' }}
                          />

                          {/* Editable Options Grid */}
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                            {['a', 'b', 'c', 'd'].map(optKey => {
                              const upperKey = optKey.toUpperCase();
                              return (
                                <div key={optKey} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <span style={{ fontSize: '0.8rem', fontWeight: 700, minWidth: '18px' }}>{upperKey}.</span>
                                  <input 
                                    type="text"
                                    value={q[`option_${optKey}`]}
                                    onChange={e => {
                                      const val = e.target.value;
                                      setAiGeneratedList(prev => prev.map((item, i) => i === idx ? { ...item, [`option_${optKey}`]: val } : item));
                                    }}
                                    style={{ width: '100%', padding: '6px 8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff', fontSize: '0.8rem' }}
                                  />
                                </div>
                              );
                            })}
                          </div>

                          {/* Correct Answer Selector & Explanation */}
                          <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: '10px', alignItems: 'center' }}>
                            <div>
                              <label style={{ fontSize: '0.72rem', color: 'var(--accent-emerald)', fontWeight: 700, display: 'block', marginBottom: '2px' }}>Correct Option</label>
                              <select 
                                value={q.correct_option}
                                onChange={e => {
                                  const val = e.target.value;
                                  setAiGeneratedList(prev => prev.map((item, i) => i === idx ? { ...item, correct_option: val } : item));
                                }}
                                style={{ width: '100%', padding: '6px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: '6px', color: 'var(--accent-emerald)', fontWeight: 700, fontSize: '0.82rem' }}
                              >
                                <option value="A">Option A</option>
                                <option value="B">Option B</option>
                                <option value="C">Option C</option>
                                <option value="D">Option D</option>
                              </select>
                            </div>

                            <div>
                              <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>Explanation</label>
                              <input 
                                type="text"
                                value={q.explanation}
                                onChange={e => {
                                  const val = e.target.value;
                                  setAiGeneratedList(prev => prev.map((item, i) => i === idx ? { ...item, explanation: val } : item));
                                }}
                                style={{ width: '100%', padding: '6px 8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff', fontSize: '0.8rem' }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Batch Save Action Footer */}
                    <div style={{ display: 'flex', gap: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                      <button 
                        onClick={handleBatchSaveAiQuestions} 
                        disabled={aiSaving || aiGeneratedList.length === 0} 
                        className="btn btn-primary" 
                        style={{ flex: 1, justifyContent: 'center', background: 'linear-gradient(135deg, #10b981, #059669)', padding: '12px' }}
                      >
                        {aiSaving ? 'Saving Questions...' : `💾 Add ${aiGeneratedList.length} Questions to Question Bank`}
                      </button>
                      <button onClick={() => { setShowAiModal(false); setAiGeneratedList([]); }} className="btn btn-secondary">Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ✂️ INTERACTIVE IMAGE CROPPER MODAL */}
          {showCropModal && (
            <ImageCropModal
              isOpen={showCropModal}
              initialImage={cropSourceImg}
              title="Crop & Resize Quiz Image"
              onClose={() => setShowCropModal(false)}
              onCropComplete={(croppedUrl) => {
                if (cropTarget === 'new') {
                  setNewQuiz(prev => ({ ...prev, image: croppedUrl }));
                } else if (cropTarget === 'edit') {
                  setEditingQuiz(prev => ({ ...prev, image: croppedUrl }));
                } else if (cropTarget === 'newQuestion') {
                  setQImages([croppedUrl]);
                } else if (cropTarget === 'editQuestion') {
                  setEditingQuestion(prev => ({ ...prev, image: croppedUrl, images: [croppedUrl] }));
                } else if (cropTarget === 'optA') {
                  setNewQuestion(prev => ({ ...prev, option_a_image: croppedUrl }));
                } else if (cropTarget === 'optB') {
                  setNewQuestion(prev => ({ ...prev, option_b_image: croppedUrl }));
                } else if (cropTarget === 'optC') {
                  setNewQuestion(prev => ({ ...prev, option_c_image: croppedUrl }));
                } else if (cropTarget === 'optD') {
                  setNewQuestion(prev => ({ ...prev, option_d_image: croppedUrl }));
                }
                setShowCropModal(false);
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}
