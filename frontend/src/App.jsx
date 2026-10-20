
import { useEffect, useState } from 'react'
import './App.css'
const API_BASE_URL = typeof window !== 'undefined' && window.location.hostname
  ? `${window.location.protocol}//${window.location.hostname}:8000`
  : 'http://127.0.0.1:8000'

async function authRequest(path, payload) {
  const csrfResponse = await fetch(API_BASE_URL + '/api/auth/csrf', {
    credentials: 'include',
  })

  if (!csrfResponse.ok) {
    throw new Error('Unable to prepare a secure request. Please check that the GradPath API is running.')
  }

  const csrfData = await csrfResponse.json()

  const response = await fetch(API_BASE_URL + path, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfData.csrf_token,
    },
    body: JSON.stringify(payload),
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    const message = typeof data.detail === 'string'
      ? data.detail
      : 'Authentication failed. Please try again.'

    throw new Error(message)
  }

  return data
}

const features = [
  {
    number: '01',
    icon: '⌘',
    title: 'Understand your profile',
    description:
      'Extract skills from your CV and see what your current profile tells you about your next career move.',
    tag: 'CV & PROFILE',
  },
  {
    number: '02',
    icon: '◈',
    title: 'Find your skill gaps',
    description:
      'Compare your profile with role-specific skills and understand where to focus your effort.',
    tag: 'SKILL DEVELOPMENT',
  },
  {
    number: '03',
    icon: '↗',
    title: 'Build a learning roadmap',
    description:
      'Turn skill gaps into practical learning actions instead of guessing what to learn next.',
    tag: 'LEARNING ROADMAP',
  },
  {
    number: '04',
    icon: '▦',
    title: 'Create proof of your skills',
    description:
      'Explore relevant projects, track your progress and submit evidence of what you have built.',
    tag: 'PROJECT WORKSPACE',
  },
]

const skills = [
  { name: 'Python', width: '88%', tone: 'violet' },
  { name: 'SQL', width: '72%', tone: 'teal' },
  { name: 'Data visualization', width: '54%', tone: 'lavender' },
]

function Brand({ light = false }) {
  return (
    <a className={`brand ${light ? 'brand-light' : ''}`} href="#home">
      <span className="brand-mark" aria-hidden="true">
        g<span>.</span>
      </span>
      <span>gradpath</span>
    </a>
  )
}

function DashboardPreview() {
  return (
    <div className="preview-shell" aria-label="Illustrative GradPath dashboard preview">
      <div className="preview-window">
        <aside className="preview-sidebar">
          <Brand />
          <span className="preview-menu-label">WORKSPACE</span>
          <span className="preview-menu-item active">▦ &nbsp; Overview</span>
          <span className="preview-menu-item">◎ &nbsp; My career</span>
          <span className="preview-menu-item">◇ &nbsp; Learning</span>
          <span className="preview-menu-item">↗ &nbsp; Projects</span>
          <div className="preview-sidebar-bottom">
            <span className="avatar">M</span>
            <span>
              <strong>Your workspace</strong>
              <small>Career development</small>
            </span>
          </div>
        </aside>

        <div className="preview-main">
          <div className="preview-topbar">
            <span>Monday, your next step starts here</span>
            <span className="preview-status"><i /> Prototype preview</span>
          </div>

          <div className="preview-heading">
            <div>
              <span className="eyebrow">YOUR CAREER OVERVIEW</span>
              <h3>A clearer path forward.</h3>
              <p>Understand where you are. Decide what comes next.</p>
            </div>
            <span className="role-chip">Data Analyst ↗</span>
          </div>

          <div className="preview-metrics">
            <div className="metric-card readiness-card">
              <span className="metric-label">VERIFIED SKILL COVERAGE</span>
              <div className="metric-number">—<span> / 100%</span></div>
              <div className="metric-footnote">
                <span className="metric-dot" /> Calculated from verified evidence
              </div>
              <div className="coverage-track"><span /></div>
              <small>Connect your profile to calculate coverage</small>
            </div>
            <div className="metric-card">
              <span className="metric-label">LEARNING PROGRESS</span>
              <div className="metric-number">Start <span>your journey</span></div>
              <div className="mini-bars" aria-hidden="true">
                <i /><i /><i /><i /><i /><i /><i /><i /><i /><i />
              </div>
              <small>Your activities will appear here</small>
            </div>
          </div>

          <div className="preview-lower">
            <div className="preview-panel">
              <div className="panel-title">
                <strong>Skill development</strong>
                <span>Illustrative only</span>
              </div>
              {skills.map((skill) => (
                <div className="skill-line" key={skill.name}>
                  <div className="skill-line-label">
                    <span>{skill.name}</span><span>Explore</span>
                  </div>
                  <div className={`skill-track ${skill.tone}`}>
                    <i style={{ width: skill.width }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="next-step-card">
              <span className="next-step-icon">✳</span>
              <span className="eyebrow">YOUR NEXT STEP</span>
              <strong>Build with purpose.</strong>
              <p>Discover projects aligned with the skills you want to develop.</p>
              <span className="next-step-link">Explore project ideas <span>→</span></span>
            </div>
          </div>
          <div className="preview-disclaimer">
            Illustrative preview · No real candidate data or scores shown
          </div>
        </div>
      </div>
      <div className="floating-note note-top">
        <span className="note-icon violet-icon">✳</span>
        <span><strong>Evidence first</strong><small>Progress with purpose</small></span>
      </div>
      <div className="floating-note note-bottom">
        <span className="note-icon teal-icon">↗</span>
        <span><strong>One step at a time</strong><small>Your journey, your pace</small></span>
      </div>
    </div>
  )
}


function AuthScreen({ mode, onNavigate, onContinue }) {
  const isLogin = mode === 'login'
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [authError, setAuthError] = useState('')

  async function handleAuthSubmit(event) {
    event.preventDefault()
    setIsSubmitting(true)
    setAuthError('')

    const formData = new FormData(event.currentTarget)
    const password = formData.get('password')

    const payload = isLogin
      ? {
          username_or_email: formData.get('username_or_email'),
          password,
        }
      : {
          username: formData.get('username'),
          email: formData.get('email'),
          password,
        }

    try {
      const result = await authRequest(
        isLogin ? '/api/auth/login' : '/api/auth/register',
        payload,
      )
      onContinue?.(result.user)
    } catch (error) {
      setAuthError(error.message || 'Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-topbar">
        <a
          className="brand"
          href="#home"
          onClick={(event) => {
            event.preventDefault()
            onNavigate('landing')
          }}
        >
          <span className="brand-mark" aria-hidden="true">
            g<span>.</span>
          </span>
          <span>gradpath</span>
        </a>
        <span className="auth-top-note">Your next step starts here.</span>
      </div>

      <section className="auth-card">
        <button
          className="auth-back"
          type="button"
          onClick={() => onNavigate('landing')}
        >
          ← Back to home
        </button>

        <div className="auth-symbol" aria-hidden="true">g.</div>
        <span className="eyebrow">
          {isLogin ? 'WELCOME BACK' : 'YOUR JOURNEY BEGINS'}
        </span>

        <h1>{isLogin ? 'Good to see you again.' : 'Make room for growth.'}</h1>
        <p className="auth-description">
          {isLogin
            ? 'Continue building a clearer path toward your career goals.'
            : 'Create your GradPath profile and start planning your next steps.'}
        </p>

        {authError && <div className="auth-prototype-notice" role="alert">{authError}</div>}

        <form onSubmit={handleAuthSubmit}>
          {!isLogin && (
            <label className="auth-field">
              Username
              <input
                type="text"
                name="username"
                placeholder="Choose a username"
                autoComplete="username"
                required
              />
            </label>
          )}

          <label className="auth-field">
            {isLogin ? 'Username or email' : 'Email address'}
            <input
              type={isLogin ? 'text' : 'email'}
              name={isLogin ? 'username_or_email' : 'email'}
              placeholder={isLogin ? 'Username or email' : 'you@example.com'}
              autoComplete={isLogin ? 'username' : 'email'}
              required
            />
          </label>

          <label className="auth-field">
            Password
            <input
              type="password"
              name="password"
              placeholder="Enter a password"
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              minLength={isLogin ? undefined : 12}
              required
            />
          </label>

          <button className="button button-dark auth-submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Please wait...' : isLogin ? 'Continue to GradPath' : 'Create your account'} <span>→</span>
          </button>
        </form>

        <p className="auth-switch">
          {isLogin ? "New to GradPath?" : 'Already have an account?'}{' '}
          <button
            type="button"
            onClick={() => onNavigate(isLogin ? 'register' : 'login')}
          >
            {isLogin ? 'Create an account' : 'Log in'}
          </button>
        </p>

        <p className="auth-privacy-note">
          Your account details are submitted securely to the GradPath API.
        </p>
      </section>

      <footer className="auth-footer">
        GradPath · Built for thoughtful progress.
      </footer>
    </main>
  )
}


function MyCareer({
  targetRole,
  onTargetRoleChange,
  currentProfile = null,
  currentCareerPlan = null,
  onProfileChange,
  onCareerPlanChange,
  currentUser = null,
}) {
  const [selectedFile, setSelectedFile] = useState(null)
  const [profile, setProfile] = useState(currentProfile)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [careerPlan, setCareerPlan] = useState(currentCareerPlan)
  const [planning, setPlanning] = useState(false)
  const [planError, setPlanError] = useState('')
  const [uploadSuccessInfo, setUploadSuccessInfo] = useState(
    currentProfile
      ? {
          filename: currentProfile.source_document?.file_type
            ? `Analyzed CV (${currentProfile.source_document.file_type.toUpperCase()})`
            : 'Uploaded CV',
          charCount: currentProfile.source_document?.text_char_count ?? 0,
          status: currentProfile.source_document?.extraction_status || 'success',
          timestamp: 'Active profile',
        }
      : null,
  )
  const [cvHistory, setCvHistory] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [loadingCvId, setLoadingCvId] = useState(null)

  useEffect(() => {
    if (currentProfile) {
      setProfile(currentProfile)
    }
  }, [currentProfile])

  useEffect(() => {
    if (currentCareerPlan) {
      setCareerPlan(currentCareerPlan)
    }
  }, [currentCareerPlan])

  const fetchCvHistory = async () => {
    if (!currentUser) return
    setLoadingHistory(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/cv/history`, {
        credentials: 'include',
      })
      if (response.ok) {
        const data = await response.json()
        setCvHistory(data.analyses || [])
      }
    } catch {
      // API may be offline or in standalone mode
    } finally {
      setLoadingHistory(false)
    }
  }

  useEffect(() => {
    fetchCvHistory()
  }, [currentUser])

  async function handleLoadSavedAnalysis(cvId, filename) {
    setLoadingCvId(cvId)
    setError('')
    try {
      const response = await fetch(`${API_BASE_URL}/api/cv/history/${cvId}`, {
        credentials: 'include',
      })
      if (!response.ok) {
        throw new Error('Could not load the saved CV analysis.')
      }
      const data = await response.json()
      if (data.analysis && data.analysis.profile) {
        const loadedProfile = data.analysis.profile
        setProfile(loadedProfile)
        setUploadSuccessInfo({
          filename: filename || data.analysis.original_filename || 'Saved CV',
          charCount: loadedProfile.source_document?.text_char_count ?? 0,
          status: loadedProfile.source_document?.extraction_status ?? 'success',
          timestamp: `Loaded from history (${new Date(data.analysis.created_at || Date.now()).toLocaleDateString()})`,
        })
        onProfileChange(loadedProfile)
        onCareerPlanChange(null)
      }
    } catch (err) {
      setError(err.message || 'Failed to load saved analysis.')
    } finally {
      setLoadingCvId(null)
    }
  }

  async function handleUpload(event) {
    event.preventDefault()

    if (!selectedFile) {
      setError('Please select a PDF or DOCX file first.')
      return
    }

    setLoading(true)
    setError('')
    setProfile(null)
    setCareerPlan(null)
    setPlanError('')
    setUploadSuccessInfo(null)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      const response = await fetch(
        `${API_BASE_URL}/api/cv/analyze`,
        {
          method: 'POST',
          credentials: 'include',
          body: formData,
        },
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(
          result.detail || 'We could not analyze this CV.',
        )
      }

      if (!result.profile) {
        throw new Error('The API returned no candidate profile.')
      }

      setProfile(result.profile)
      setUploadSuccessInfo({
        filename: selectedFile.name,
        charCount: result.profile.source_document?.text_char_count ?? 0,
        status: result.profile.source_document?.extraction_status ?? 'success',
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      })
      onProfileChange(result.profile)
      onCareerPlanChange(null)
      fetchCvHistory()
    } catch (err) {
      setError(
        err.message ||
          'Could not connect to GradPath. Check that the API is running.',
      )
    } finally {
      setLoading(false)
    }
  }

    async function handleGeneratePlan() {
    if (!profile) {
      setPlanError('Analyze your CV before generating a career plan.')
      return
    }

    setPlanning(true)
    setPlanError('')
    setCareerPlan(null)

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/career/plan`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            candidate_profile: profile,
            target_role: targetRole,
          }),
        },
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(
          result.detail || 'Could not generate your career plan.',
        )
      }

      setCareerPlan(result)
      onCareerPlanChange(result)
    } catch (err) {
      setPlanError(
        err.message ||
          'Could not connect to GradPath. Check that the API is running.',
      )
    } finally {
      setPlanning(false)
    }
  }

  const skills = profile?.skills || []

  const profileSections = [
    { title: 'Education', items: profile?.education || [] },
    { title: 'Experience', items: profile?.experience || [] },
    { title: 'Projects', items: profile?.projects || [] },
    {
      title: 'Certifications',
      items: profile?.certifications || [],
    },
  ]

  const totalPopulatedSections = profileSections.filter(
    (section) => section.items.length > 0,
  ).length
  const totalSkillsDetected = skills.length
  const extractionStatus =
    profile?.source_document?.extraction_status || 'unknown'
  const isProfileEmpty = Boolean(
    profile &&
      (extractionStatus === 'failed' ||
        (totalPopulatedSections === 0 &&
          totalSkillsDetected === 0 &&
          (profile?.source_document?.text_char_count || 0) < 50)),
  )
  const isPartialExtraction = extractionStatus === 'partial'

  return (
    <section className="career-page">
      <div className="career-intro">
        <span className="eyebrow">YOUR PROFESSIONAL PROFILE</span>
        <h1>Start with your experience.</h1>
        <p>
          Upload your CV to build your starting profile.
          Review what GradPath extracts before deciding your next step.
        </p>
      </div>

      <section className="career-upload-card">
        <div className="career-card-heading">
          <span className="career-upload-icon" aria-hidden="true">
            CV
          </span>
          <div>
            <h2>Upload your CV</h2>
            <p>PDF or DOCX · Maximum size 5 MB</p>
          </div>
        </div>

                <label className="career-role-select">
          <span>Target career role</span>
          <select
            value={targetRole}
            onChange={(event) => {
            onTargetRoleChange(event.target.value)
            setCareerPlan(null)
            onCareerPlanChange(null)
            setPlanError('')
          }}
          >
            <option value="Data Analyst">Data Analyst</option>
            <option value="Data Scientist">Data Scientist</option>
          </select>
        </label>

        <form onSubmit={handleUpload}>
           <p className="career-upload-guidance">
            Upload your latest CV to build your career profile. GradPath will
            extract relevant information and identify skills mentioned in your CV.
            Detected skills are not automatically verified.
          </p>
          <label className="career-file-label">
            <span>Choose a CV file</span>
            <input
              type="file"
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={(event) => {
                setSelectedFile(event.target.files?.[0] || null)
                setError('')
              }}
            />
          </label>

          {selectedFile && (
            <p className="career-selected-file">
              Selected: {selectedFile.name}
            </p>
          )}

          <button
            className="workspace-primary-button career-upload-button"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Analyzing your CV...' : 'Analyze my CV'}
          </button>
        </form>

        <p className="career-privacy-note">
          {currentUser
            ? 'Your CV analysis is securely stored in your personal account history for instant recall.'
            : 'Your file is processed safely by the local GradPath engine.'}
        </p>

        {error && !loading && (
          <div className="career-feedback-banner is-error" role="alert">
            <span className="banner-icon" aria-hidden="true">
              ⚠
            </span>
            <div className="career-feedback-content">
              <div className="career-feedback-title">
                <span>Could not analyze this CV</span>
                <span
                  className="career-status-badge"
                  style={{ background: '#fce8e8', color: '#9c3434' }}
                >
                  Error
                </span>
              </div>
              <p>{error}</p>
              <ul className="career-feedback-steps">
                <li>
                  Verify your file is a readable <strong>PDF</strong> or{' '}
                  <strong>DOCX</strong> document and is smaller than 5 MB.
                </li>
                <li>
                  Ensure the file is not password-protected, encrypted, or corrupted.
                </li>
                <li>
                  Check that the GradPath local API service is running on{' '}
                  <code>{API_BASE_URL}</code>.
                </li>
              </ul>
            </div>
          </div>
        )}
      </section>

      {currentUser && cvHistory.length > 0 && (
        <section className="career-history-card" aria-label="Saved CV Analyses">
          <div className="career-card-heading">
            <span
              className="career-upload-icon"
              aria-hidden="true"
              style={{ background: '#f0edf9', color: '#7160b5' }}
            >
              📁
            </span>
            <div>
              <h2>Saved CV Analyses ({cvHistory.length})</h2>
              <p>Previously analyzed profiles associated with your account. Select any CV to restore its analysis.</p>
            </div>
          </div>

          <div className="career-history-list">
            {cvHistory.map((item) => (
              <div key={item.cv_id} className="career-history-item">
                <div className="career-history-meta">
                  <span className="career-history-format-badge">
                    {item.file_type?.toUpperCase() || 'CV'}
                  </span>
                  <div>
                    <strong className="career-history-filename">{item.original_filename}</strong>
                    <span className="career-history-date">
                      Uploaded {new Date(item.created_at).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  className="career-history-load-button"
                  onClick={() => handleLoadSavedAnalysis(item.cv_id, item.original_filename)}
                  disabled={loadingCvId === item.cv_id || loading}
                >
                  {loadingCvId === item.cv_id ? 'Loading...' : 'Load CV →'}
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {loading && (
        <div
          className="career-feedback-banner is-loading"
          role="status"
          aria-live="polite"
        >
          <span className="banner-icon" aria-hidden="true">
            ⏳
          </span>
          <div className="career-feedback-content">
            <div className="career-feedback-title">
              <span>Analyzing your CV...</span>
              <span className="career-status-badge">In progress</span>
            </div>
            <p>
              Extracting text from{' '}
              <strong>{selectedFile?.name || 'your document'}</strong>, identifying
              profile sections (Education, Experience, Projects), and detecting
              skill mentions.
            </p>
            <div className="career-loading-bar-track">
              <div className="career-loading-bar-fill" />
            </div>
          </div>
        </div>
      )}

      {profile && isProfileEmpty && (
        <div
          className="career-empty-card"
          role="region"
          aria-label="Empty profile results"
        >
          <div className="career-empty-card-icon" aria-hidden="true">
            📄
          </div>
          <h3>No profile details could be extracted</h3>
          <p>
            We received{' '}
            <strong>{uploadSuccessInfo?.filename || 'your document'}</strong>, but
            GradPath could not detect standard section headings (Education,
            Experience, Projects, Certifications) or recognizable skill keywords.
          </p>

          <div className="career-empty-card-tips">
            <strong>Common reasons and troubleshooting steps:</strong>
            <div>
              • <strong>Image-based / scanned PDF:</strong> The text cannot be
              highlighted or selected. Please re-export or save as a standard
              searchable PDF or Word document.
            </div>
            <div>
              • <strong>Complex multi-column or graphical layout:</strong> Visual CV
              builders with unusual text blocks may obscure document structure.
              Use standard headings.
            </div>
            <div>
              • <strong>Missing section headings:</strong> Clearly label your
              sections as <em>Education</em>, <em>Experience</em>, <em>Projects</em>
              , or <em>Certifications</em>.
            </div>
          </div>

          <button
            type="button"
            className="workspace-primary-button"
            onClick={() => {
              setProfile(null)
              setSelectedFile(null)
              onProfileChange(null)
            }}
          >
            Upload a different CV <span>→</span>
          </button>
        </div>
      )}

      {profile && !isProfileEmpty && (
        <div className="career-results">
          {/* Success Confirmation Banner */}
          <div className="career-feedback-banner is-success">
            <span className="banner-icon" aria-hidden="true">
              ✓
            </span>
            <div className="career-feedback-content">
              <div className="career-feedback-title">
                <span>CV analyzed successfully</span>
                <span className="career-status-badge">
                  {isPartialExtraction
                    ? 'Partial extraction'
                    : 'Clean extraction'}
                </span>
              </div>
              <p>
                Extracted from{' '}
                <strong>
                  {uploadSuccessInfo?.filename ||
                    (profile.source_document?.file_type
                      ? `CV (${profile.source_document.file_type.toUpperCase()})`
                      : 'CV document')}
                </strong>
                .
                {profile.source_document?.text_char_count
                  ? ` ${profile.source_document.text_char_count.toLocaleString()} characters processed.`
                  : ''}
              </p>
              <div className="career-feedback-meta">
                <span>
                  Format:{' '}
                  {(
                    profile.source_document?.file_type || 'PDF/DOCX'
                  ).toUpperCase()}
                </span>
                {uploadSuccessInfo?.timestamp && (
                  <span>Analyzed: {uploadSuccessInfo.timestamp}</span>
                )}
                <span>
                  Status:{' '}
                  {profile.source_document?.extraction_status || 'success'}
                </span>
              </div>
            </div>
          </div>

          {/* Review Required Advisory Banner */}
          <div className="career-feedback-banner is-review">
            <span className="banner-icon" aria-hidden="true">
              ℹ
            </span>
            <div className="career-feedback-content">
              <div className="career-feedback-title">
                <span>Profile review recommended</span>
                <span className="career-unverified-badge">Review needed</span>
              </div>
              <p>
                GradPath automatically extracts profile records and skill
                mentions using heuristic pattern matching. Review your extracted
                profile to confirm accuracy before proceeding:
              </p>
              <ul className="career-feedback-steps">
                <li>
                  <strong>Check the 4 profile sections below:</strong> Verify that
                  Education, Experience, Projects, and Certifications entries are
                  correctly identified.
                </li>
                <li>
                  <strong>Detected skills are unverified mentions:</strong> A skill
                  mention in a CV does not prove proficiency. Skills remain
                  unverified until backed by verified project evidence or
                  assessments.
                </li>
              </ul>
              {profile.extraction_warnings?.length > 0 && (
                <div
                  style={{
                    marginTop: '10px',
                    paddingTop: '10px',
                    borderTop: '1px dashed #ead9a9',
                  }}
                >
                  <strong>Parser notes &amp; warnings:</strong>
                  <ul
                    className="career-feedback-steps"
                    style={{ marginTop: '5px' }}
                  >
                    {profile.extraction_warnings.map((warning, index) => (
                      <li key={index}>
                        {typeof warning === 'string'
                          ? warning
                          : JSON.stringify(warning)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <section className="career-results-header">
            <div>
              <span className="eyebrow">CV ANALYSIS RESULTS</span>
              <h2>Your starting profile</h2>
              <p>
                Extraction status:{' '}
                <strong>
                  {profile.source_document?.extraction_status || 'Unknown'}
                </strong>
              </p>
            </div>
            <span className="career-status-badge">
              Profile extracted
            </span>
          </section>

          
          <div className="career-summary-grid">
            <article className="career-summary-card">
              <span>Skills Detected</span>
              <strong>{(profile.skills || []).length}</strong>
              <small>CV mentions · unverified by default</small>
            </article>

            <article className="career-summary-card">
              <span>Sections Populated</span>
              <strong>
                {profileSections.filter((section) => section.items.length > 0).length}
              </strong>
              <small>Of 4 profile sections</small>
            </article>

            <article className="career-summary-card">
              <span>Skills with Evidence</span>
              <strong>
                {(profile.skills || []).filter((skill) =>
                  (skill.evidence || []).some(
                    (evidence) => Boolean(evidence.text?.trim()),
                  ),
                ).length}
              </strong>
              <small>Supporting CV text available</small>
            </article>

            <article className="career-summary-card">
              <span>Review Status</span>
              <strong>Review</strong>
              <small>Check extracted details and skill evidence</small>
            </article>
          </div>


          <section className="career-results-card">
            <div className="career-section-heading">
              <div>
                <span className="eyebrow">SKILLS FOUND IN YOUR CV</span>
                <h2>Skills identified</h2>
              </div>
              <span className="career-unverified-badge">Unverified</span>
            </div>

            <p className="career-explanation">
              GradPath found these skills through text matching. A mention in
              your CV does not prove proficiency. Skills remain unverified until
              they meet GradPath's verification criteria using supported
              evidence, such as assessments or project evidence.
            </p>

            {skills.length > 0 ? (
              <div className="career-skills-list">
                {skills.map((skill, index) => (
                  <details
                    className="career-skill-item"
                    key={`${skill.skill_id || skill.skill_name || 'skill'}-${index}`}
                  >
                    <summary className="career-skill-summary">
                      <span className="career-skill-name">
                        {skill.skill_name || 'Unnamed skill'}
                        <small>{skill.skill_category || 'Category not specified'}</small>
                      </span>
                      <span className="career-skill-status">Unverified</span>
                    </summary>

                    <div className="career-skill-detail">
                      <p>
                        <strong>Why unverified?</strong> This skill was identified
                        in CV text, but GradPath has not confirmed your proficiency
                        against its verification criteria.
                      </p>

                      {Array.isArray(skill.evidence) && skill.evidence.length > 0 ? (
                        <div className="career-skill-evidence">
                          <strong>Evidence found in your CV</strong>
                          <ul className="career-evidence-list">
                            {skill.evidence.slice(0, 3).map((item, evidenceIndex) => (
                              <li key={evidenceIndex}>
                                <span className="career-evidence-section">
                                  {(item.section || 'CV').replace(/_/g, ' ')}
                                </span>
                                <p>{item.text || 'Evidence text unavailable.'}</p>
                              </li>
                            ))}
                          </ul>
                          {skill.evidence.length > 3 && (
                            <p className="career-evidence-more">
                              {skill.evidence.length - 3} additional evidence matches
                              are available.
                            </p>
                          )}
                        </div>
                      ) : (
                        <p>No supporting CV excerpt is available for this skill.</p>
                      )}
                    </div>
                  </details>
                ))}
              </div>
            ) : (
              <p>No skill mentions were extracted from this CV.</p>
            )}
          </section>

                    <section className="career-results-card career-plan-card">
            <div className="career-section-heading">
              <div>
                <span className="eyebrow">YOUR NEXT STEPS</span>
                <h2>Career plan</h2>
              </div>
              <span className="career-status-badge">{targetRole}</span>
            </div>

            <p className="career-explanation">
              Compare your CV evidence with role-specific skills and observed
              job-market data. Missing CV mentions are potential gaps, not
              proof that you lack a skill.
            </p>

            <button
              type="button"
              className="workspace-primary-button"
              onClick={handleGeneratePlan}
              disabled={planning}
            >
              {planning
                ? 'Generating your career plan...'
                : careerPlan
                  ? 'Refresh career plan'
                  : 'Analyze skill gaps and learning'}
            </button>

            {planError && (
              <div className="career-message career-error" role="alert">
                {planError}
              </div>
            )}

            {planning && (
              <div className="career-message" role="status">
                Analyzing skill evidence and matching learning resources...
              </div>
            )}

            {careerPlan && (
              <div className="career-plan-results">
                <div className="career-plan-counts">
                  <article className="career-summary-card">
                    <span>Skills assessed</span>
                    <strong>{careerPlan.skill_gaps.length}</strong>
                  </article>
                  <article className="career-summary-card">
                    <span>Learning actions</span>
                    <strong>{careerPlan.learning_actions.length}</strong>
                  </article>
                </div>

                <h3>Skill-gap analysis</h3>

                
                  {careerPlan.skill_gaps.length > 0 ? (
                    <>
                      <div className="career-plan-list">
                        {careerPlan.skill_gaps.slice(0, 6).map((gap) => (
                          <article
                            className="career-plan-item"
                            key={gap.skill_id}
                          >
                            <div className="career-plan-item-heading">
                              <strong>{gap.skill_name}</strong>
                              <span>
                                {(gap.candidate_status || '').replace(/_/g, ' ')}
                              </span>
                            </div>

                            <p>{gap.explanation}</p>

                            <small>
                              Market evidence: {gap.market_evidence_status || 'Not available'}
                              {' · '}
                              Priority score: {gap.priority_score ?? 'Not available'}
                            </small>
                          </article>
                        ))}
                      </div>

                      {careerPlan.skill_gaps.length > 6 && (
                        <details className="all-skill-gaps">
                          <summary>
                            View all {careerPlan.skill_gaps.length} skill-gap records
                          </summary>

                          <div className="career-plan-list">
                            {careerPlan.skill_gaps.slice(6).map((gap) => (
                              <article
                                className="career-plan-item"
                                key={gap.skill_id}
                              >
                                <div className="career-plan-item-heading">
                                  <strong>{gap.skill_name}</strong>
                                  <span>
                                    {(gap.candidate_status || '').replace(/_/g, ' ')}
                                  </span>
                                </div>

                                <p>{gap.explanation}</p>

                                <small>
                                  Market evidence: {gap.market_evidence_status || 'Not available'}
                                  {' · '}
                                  Priority score: {gap.priority_score ?? 'Not available'}
                                </small>
                              </article>
                            ))}
                          </div>
                        </details>
                      )}
                    </>
                  ) : (
                    <p>No skill-gap records were returned for this role.</p>
                  )}


                <h3>Recommended learning actions</h3>

                {careerPlan.learning_actions.length > 0 ? (
                  
              <div className="career-plan-list">
                {careerPlan.learning_actions.map((action) => (
                  <article
                    className="career-plan-item learning-action-card"
                    key={`${action.skill_id}-${action.recommended_action}`}
                  >
                    <div className="career-plan-item-heading">
                      <strong>{action.skill_name}</strong>
                      <span>
                        {(action.recommended_action || 'review').replace(/_/g, ' ')}
                      </span>
                    </div>

                    {action.resource_title && (
                      <h4 className="learning-resource-title">
                        {action.resource_title}
                      </h4>
                    )}

                    {action.resource_description && (
                      <p className="learning-resource-description">
                        {action.resource_description}
                      </p>
                    )}

                    <div className="learning-resource-meta">
                      <span>{action.difficulty || 'Difficulty not specified'}</span>
                      <span>{action.access_type || 'Access details not specified'}</span>
                    </div>

                    {action.resource_url && (
                      <a
                        className="learning-resource-link"
                        href={action.resource_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Open learning resource
                        <span aria-hidden="true"> ↗</span>
                      </a>
                    )}

                    <details className="learning-evidence-details">
                      <summary>Why this recommendation?</summary>
                      <p>{action.explanation}</p>

                      <div className="learning-evidence-stats">
                        <span>
                          Market evidence: {action.market_evidence_status || 'Not available'}
                        </span>
                        <span>
                          Observed jobs: {action.market_jobs_with_skill ?? 'Not available'}
                          {' / '}
                          {action.market_relevant_jobs_total ?? 'Not available'}
                        </span>
                        <span>
                          Priority score: {action.priority_score ?? 'Not available'}
                        </span>
                      </div>

                      {action.esco_mapping_status && (
                        <p>
                          <strong>ESCO mapping:</strong> {action.esco_mapping_status}
                          {action.esco_relationship
                            ? ` · ${action.esco_relationship}`
                            : ''}
                          {action.esco_label ? ` · ${action.esco_label}` : ''}
                        </p>
                      )}
                    </details>
                  </article>
                ))}
              </div>

                ) : (
                  <p>
                    No learning actions were returned. This can happen when
                    suitable resources are unavailable for the current results.
                  </p>
                )}
              </div>
            )}
          </section>
          
          
          <section className="career-results-card career-skills-card">
            <div className="career-section-heading">
              <div>
                <h2>Detected Skills</h2>
                <p className="career-skills-intro">
                  Skills identified in your CV. These mentions are not proof of
                  proficiency.
                </p>
              </div>
              <span>{(profile?.skills || []).length} detected</span>
            </div>

            {(profile?.skills || []).length > 0 ? (
              <div className="career-skills-list">
                {(profile?.skills || []).map((skill, index) => (
                  <article
                    className="career-skill-item"
                    key={`${skill.skill_id || skill.skill_name}-${index}`}
                  >
                    <div className="career-skill-top">
                      <div>
                        <h3>{skill.skill_name || 'Unnamed skill'}</h3>
                        <span className="career-skill-category">
                          {skill.skill_category || 'Category unavailable'}
                        </span>
                      </div>
                      <span className="career-skill-status">
                        {skill.verification_status === 'verified'
                          ? 'Verified'
                          : 'Unverified'}
                      </span>
                    </div>

                    {skill.evidence?.length > 0 ? (
                      <div className="career-skill-evidence">
                        <strong>CV evidence</strong>
                        {skill.evidence.map((evidence, evidenceIndex) => (
                          <div
                            className="career-skill-evidence-item"
                            key={`${evidence.section || 'section'}-${evidenceIndex}`}
                          >
                            <span>
                              {evidence.section || 'CV section'}
                              {evidence.evidence_type
                                ? ` · ${evidence.evidence_type}`
                                : ''}
                            </span>
                            {evidence.text && <p>{evidence.text}</p>}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="career-skill-no-evidence">
                        No supporting text is available for this skill.
                      </p>
                    )}
                  </article>
                ))}
              </div>
            ) : (
              <p className="career-skills-empty">
                No skills have been detected yet. Upload your CV to view extracted
                skills and their available evidence.
              </p>
            )}
          </section>


          {profileSections.map((section) => (
            <section
              className="career-results-card"
              key={section.title}
            >
              <div className="career-section-heading">
                <h2>{section.title}</h2>
                <span>{section.items.length} entries</span>
              </div>

              {section.items.length > 0 ? (
                <div className="career-entry-list">
                  {section.items.map((item, index) => (
                    <article
                      className="career-entry"
                      key={`${section.title}-${index}`}
                    >
                      
                      {Object.entries(item).map(([key, value]) => {
                        if (
                          value === null ||
                          value === undefined ||
                          value === ''
                        ) {
                          return null
                        }

                        const label = key
                          .replace(/_/g, ' ')
                          .replace(/\b\w/g, (letter) => letter.toUpperCase())

                        const displayValue = Array.isArray(value)
                          ? value
                              .map((entry) =>
                                typeof entry === 'object' && entry !== null
                                  ? Object.values(entry)
                                      .filter(
                                        (part) =>
                                          part !== null &&
                                          part !== undefined &&
                                          typeof part !== 'object',
                                      )
                                      .join(' — ')
                                  : String(entry),
                              )
                              .filter(Boolean)
                              .join(', ')
                          : typeof value === 'object'
                            ? Object.entries(value)
                                .filter(
                                  ([, part]) =>
                                    part !== null &&
                                    part !== undefined &&
                                    typeof part !== 'object',
                                )
                                .map(
                                  ([nestedKey, part]) =>
                                    `${nestedKey.replace(/_/g, ' ')}: ${part}`,
                                )
                                .join(' · ')
                            : String(value)

                        if (!displayValue.trim()) return null

                        return (
                          <div
                            className="career-entry-field"
                            key={key}
                          >
                            <span className="career-entry-label">
                              {label}
                            </span>
                            <span className="career-entry-value">
                              {displayValue}
                            </span>
                          </div>
                        )
                      })}

                    </article>
                  ))}
                </div>
              ) : (
                <p className="career-empty-note">
                  No entries extracted for this section.
                </p>
              )}
            </section>
          ))}

          {profile.extraction_warnings?.length > 0 && (
            <section className="career-message career-warning">
              <strong>Extraction notes</strong>
              <ul>
                {profile.extraction_warnings.map((warning, index) => (
                  <li key={index}>
                    {typeof warning === 'string'
                      ? warning
                      : JSON.stringify(warning)}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </section>
  )
}

const DEFAULT_ANALYST_PROJECTS = [
  {
    id: 'da_proj_1',
    title: 'Executive Sales & Revenue Performance Dashboard',
    domain: 'Business Intelligence',
    difficulty: 'Intermediate',
    duration: '2–3 weeks',
    objective:
      'Build an automated, multi-page business dashboard tracking monthly recurring revenue, customer acquisition cost, regional sales performance, and churn.',
    skills: ['SQL', 'Power BI', 'KPI Reporting', 'Data Modeling', 'Excel'],
    deliverables: [
      'Star-schema SQL data model with cleaned transactions',
      'Interactive executive dashboard with slicers and KPI cards',
      'Written 1-page business insights briefing with actionable recommendations',
    ],
    status: 'suggested',
    evidence: null,
  },
  {
    id: 'da_proj_2',
    title: 'Customer Segmentation & Behavioral RFM Analysis',
    domain: 'Customer Analytics',
    difficulty: 'Intermediate',
    duration: '1–2 weeks',
    objective:
      'Analyze e-commerce purchase history using Recency, Frequency, and Monetary (RFM) segmentation to identify churn-risk cohorts and high-value customer groups.',
    skills: ['Python', 'Pandas', 'Data Visualization', 'SQL', 'RFM Scoring'],
    deliverables: [
      'Documented Jupyter Notebook with exploratory cohort analysis',
      'Visual distribution of customer tiers (Champions, At-Risk, Lost)',
      'Segment-targeted retention strategy deck',
    ],
    status: 'suggested',
    evidence: null,
  },
  {
    id: 'da_proj_3',
    title: 'Marketing Campaign Attribution & Funnel Analytics',
    domain: 'Growth & Marketing',
    difficulty: 'Beginner–Intermediate',
    duration: '1 week',
    objective:
      'Evaluate digital advertising spend and multi-stage conversion funnels to calculate customer acquisition ROI and uncover conversion bottlenecks.',
    skills: ['SQL', 'Funnel Analysis', 'Data Analysis', 'Tableau', 'Statistics'],
    deliverables: [
      'Funnel stage drop-off analysis SQL script',
      'Campaign CAC vs LTV comparative visual report',
      'A/B testing conversion rate evaluation summary',
    ],
    status: 'suggested',
    evidence: null,
  },
]

const DEFAULT_SCIENTIST_PROJECTS = [
  {
    id: 'ds_proj_1',
    title: 'Customer Churn ML Pipeline with SHAP Explainability',
    domain: 'Predictive Modeling',
    difficulty: 'Intermediate–Advanced',
    duration: '2–3 weeks',
    objective:
      'Engineer a predictive classification pipeline to identify customers at risk of churn, addressing class imbalance and explaining individual predictions with SHAP values.',
    skills: ['Python', 'scikit-learn', 'Feature Engineering', 'ROC-AUC Evaluation', 'SHAP'],
    deliverables: [
      'Reproducible feature engineering pipeline with cross-validation',
      'Model comparison benchmark (Logistic Regression, Random Forest, LightGBM)',
      'SHAP beeswarm and force plots showing feature importance',
      'Public GitHub repository with environment and test instructions',
    ],
    status: 'suggested',
    evidence: null,
  },
  {
    id: 'ds_proj_2',
    title: 'Exploratory Data Analysis & Statistical Hypothesis Testing',
    domain: 'Inference & Statistics',
    difficulty: 'Intermediate',
    duration: '1–2 weeks',
    objective:
      'Perform thorough exploratory analysis and hypothesis testing on product feature adoption data to determine whether new UX workflows drive statistically significant engagement.',
    skills: ['Python', 'Pandas', 'SciPy', 'Matplotlib/Seaborn', 'Hypothesis Testing'],
    deliverables: [
      'Statistical distribution analysis and outlier treatment notebook',
      'Parametric and non-parametric tests (two-sample t-test, Mann-Whitney U)',
      'Executive findings slide deck with statistical confidence intervals',
    ],
    status: 'suggested',
    evidence: null,
  },
  {
    id: 'ds_proj_3',
    title: 'Production ML Inference Service & Evaluation API',
    domain: 'ML Engineering',
    difficulty: 'Advanced',
    duration: '2 weeks',
    objective:
      'Package a trained predictive model into an asynchronous FastAPI service with input validation (Pydantic), health checks, automated pytest test suite, and Docker containerization.',
    skills: ['Python', 'FastAPI', 'Docker', 'pytest', 'scikit-learn', 'REST APIs'],
    deliverables: [
      'FastAPI prediction application with schema validation',
      'Automated test suite achieving > 85% code coverage',
      'Dockerfile and README with curl demonstration commands',
    ],
    status: 'suggested',
    evidence: null,
  },
]

function LearningRoadmap({
  targetRole,
  careerPlan,
  learningProgress,
  onToggleProgress,
  onNavigate,
}) {
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterDifficulty, setFilterDifficulty] = useState('all')

  const actions = careerPlan?.learning_actions || []

  const sampleRoadmap =
    targetRole === 'Data Scientist'
      ? [
          {
            skill_id: 'sample_py',
            skill_name: 'Python for Data Science & Numerical Analysis',
            resource_title: 'NumPy & Pandas for Statistical Computing',
            resource_description:
              'Master vectorized operations, dataframe manipulation, missing value imputation, and reproducible feature transformation.',
            difficulty: 'Intermediate',
            access_type: 'Open Access',
            resource_url: 'https://pandas.pydata.org/docs/user_guide/index.html',
            explanation:
              'Core prerequisite for ML workflows and data transformation pipelines.',
            market_jobs_with_skill: 184,
            market_relevant_jobs_total: 251,
            priority_score: 94,
          },
          {
            skill_id: 'sample_ml',
            skill_name: 'Supervised Learning & Model Validation',
            resource_title: 'Scikit-Learn Machine Learning Architecture',
            resource_description:
              'Cross-validation strategies, regularized regression, gradient boosting, and metric evaluation (ROC-AUC, Precision-Recall, F1).',
            difficulty: 'Intermediate',
            access_type: 'Free Guide',
            resource_url: 'https://scikit-learn.org/stable/tutorial/index.html',
            explanation:
              'Primary foundation for predictive modeling and automated decision systems.',
            market_jobs_with_skill: 162,
            market_relevant_jobs_total: 251,
            priority_score: 89,
          },
          {
            skill_id: 'sample_api',
            skill_name: 'ML Deployment & REST APIs',
            resource_title: 'FastAPI for Asynchronous Model Serving',
            resource_description:
              'Package predictive models into high-performance web endpoints with Pydantic schema validation and health checks.',
            difficulty: 'Advanced',
            access_type: 'Interactive Guide',
            resource_url: 'https://fastapi.tiangolo.com/tutorial/',
            explanation:
              'Critical for moving from exploratory notebooks into deployable production systems.',
            market_jobs_with_skill: 78,
            market_relevant_jobs_total: 251,
            priority_score: 82,
          },
        ]
      : [
          {
            skill_id: 'sample_sql',
            skill_name: 'Advanced SQL & Relational Modeling',
            resource_title: 'PostgreSQL Analytical Queries & Window Functions',
            resource_description:
              'Complex multi-table joins, subqueries, CTEs, and window functions (RANK, ROW_NUMBER, LAG/LEAD) for cohort analysis.',
            difficulty: 'Beginner–Intermediate',
            access_type: 'Open Guide',
            resource_url: 'https://www.postgresql.org/docs/current/tutorial-window.html',
            explanation:
              'Essential analytical skill appearing in over 75% of active Data Analyst job listings.',
            market_jobs_with_skill: 198,
            market_relevant_jobs_total: 251,
            priority_score: 96,
          },
          {
            skill_id: 'sample_bi',
            skill_name: 'Business Intelligence & Executive Dashboards',
            resource_title: 'Power BI Data Modeling & DAX Patterns',
            resource_description:
              'Design dimensional star schemas, write calculated measures with DAX, and build interactive stakeholder reports.',
            difficulty: 'Intermediate',
            access_type: 'Free Course',
            resource_url: 'https://learn.microsoft.com/en-us/power-bi/',
            explanation:
              'Transforms raw transactional data into intuitive visualizations for executive decision making.',
            market_jobs_with_skill: 142,
            market_relevant_jobs_total: 251,
            priority_score: 88,
          },
          {
            skill_id: 'sample_kpi',
            skill_name: 'Exploratory Data Analysis & Business KPIs',
            resource_title: 'Descriptive Analytics & Metrics Definition',
            resource_description:
              'Calculate customer lifetime value, customer acquisition cost, retention rates, and churn metrics from transactional logs.',
            difficulty: 'Beginner',
            access_type: 'Open Guide',
            resource_url: 'https://en.wikipedia.org/wiki/Performance_indicator',
            explanation:
              'Connects quantitative database numbers directly with business strategy and measurable impact.',
            market_jobs_with_skill: 120,
            market_relevant_jobs_total: 251,
            priority_score: 84,
          },
        ]

  const displayActions = actions.length > 0 ? actions : sampleRoadmap
  const isSample = actions.length === 0

  const filteredActions = displayActions.filter((action) => {
    const actionId = action.skill_id || action.title || action.skill_name
    const currentStatus = learningProgress[actionId] || 'not_started'
    const statusMatch = filterStatus === 'all' || currentStatus === filterStatus

    const difficulty = (action.difficulty || '').toLowerCase()
    const diffMatch =
      filterDifficulty === 'all' ||
      (filterDifficulty === 'beginner' && difficulty.includes('begin')) ||
      (filterDifficulty === 'intermediate' && difficulty.includes('inter')) ||
      (filterDifficulty === 'advanced' && difficulty.includes('adv'))

    return statusMatch && diffMatch
  })

  const totalCount = displayActions.length
  const completedCount = displayActions.filter(
    (a) =>
      learningProgress[a.skill_id || a.title || a.skill_name] === 'completed',
  ).length
  const inProgressCount = displayActions.filter(
    (a) =>
      learningProgress[a.skill_id || a.title || a.skill_name] === 'in_progress',
  ).length
  const highPriorityCount = displayActions.filter(
    (a) => (a.priority_score || 0) >= 80,
  ).length
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  return (
    <section className="roadmap-page">
      <button
        type="button"
        className="workspace-back-link"
        onClick={() => onNavigate('Overview')}
      >
        ← Back to overview
      </button>

      <div className="career-intro">
        <span className="eyebrow">INTENTIONAL CAREER ROADMAP</span>
        <h1>Your {targetRole} learning roadmap.</h1>
        <p>
          {isSample
            ? `Below is a recommended foundational curriculum for ${targetRole}. Analyze your CV in My Career to personalize recommendations to your exact skill gaps.`
            : `Personalized recommendations generated from your CV skill-gap analysis. Each action targets an observed requirement for ${targetRole}.`}
        </p>
      </div>

      <div className="roadmap-summary-bar">
        <article className="roadmap-summary-card">
          <span>Total Actions</span>
          <strong>{totalCount}</strong>
          <small>{isSample ? 'Curated baseline' : 'Target role plan'}</small>
        </article>
        <article className="roadmap-summary-card">
          <span>In Progress</span>
          <strong style={{ color: '#0d6efd' }}>{inProgressCount}</strong>
          <small>Active learning</small>
        </article>
        <article className="roadmap-summary-card">
          <span>Completed</span>
          <strong style={{ color: '#198754' }}>{completedCount}</strong>
          <small>Demonstrated learning</small>
        </article>
        <article className="roadmap-summary-card">
          <span>High Market Demand</span>
          <strong style={{ color: '#6551a4' }}>{highPriorityCount}</strong>
          <small>Adzuna priority ≥ 80</small>
        </article>
      </div>

      <div className="roadmap-progress-container">
        <div className="roadmap-progress-header">
          <span>Roadmap Completion</span>
          <span>{progressPercent}% ({completedCount} of {totalCount} completed)</span>
        </div>
        <div className="roadmap-progress-track">
          <div
            className="roadmap-progress-fill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {isSample && (
        <div className="career-feedback-banner is-review">
          <span className="banner-icon" aria-hidden="true">ℹ</span>
          <div className="career-feedback-content">
            <div className="career-feedback-title">
              <span>Preview Mode: Recommended Core Curriculum</span>
              <span className="career-unverified-badge">{targetRole}</span>
            </div>
            <p>
              This is a standard core curriculum for <strong>{targetRole}</strong>. To personalize this roadmap to your existing experience and identify your specific skill gaps:
            </p>
            <button
              type="button"
              className="workspace-primary-button"
              style={{ marginTop: '10px' }}
              onClick={() => onNavigate('My Career')}
            >
              Analyze your CV to personalize roadmap <span>→</span>
            </button>
          </div>
        </div>
      )}

      <div className="roadmap-filter-bar">
        <span style={{ fontSize: '12px', fontWeight: 700, color: '#35415e', marginRight: '6px' }}>Filter:</span>
        <button
          type="button"
          className={`roadmap-filter-chip ${filterStatus === 'all' ? 'active' : ''}`}
          onClick={() => setFilterStatus('all')}
        >
          All Actions ({totalCount})
        </button>
        <button
          type="button"
          className={`roadmap-filter-chip ${filterStatus === 'not_started' ? 'active' : ''}`}
          onClick={() => setFilterStatus('not_started')}
        >
          Not Started
        </button>
        <button
          type="button"
          className={`roadmap-filter-chip ${filterStatus === 'in_progress' ? 'active' : ''}`}
          onClick={() => setFilterStatus('in_progress')}
        >
          In Progress ({inProgressCount})
        </button>
        <button
          type="button"
          className={`roadmap-filter-chip ${filterStatus === 'completed' ? 'active' : ''}`}
          onClick={() => setFilterStatus('completed')}
        >
          Completed ({completedCount})
        </button>

        <span style={{ fontSize: '12px', fontWeight: 700, color: '#35415e', marginLeft: '12px', marginRight: '6px' }}>Level:</span>
        <button
          type="button"
          className={`roadmap-filter-chip ${filterDifficulty === 'all' ? 'active' : ''}`}
          onClick={() => setFilterDifficulty('all')}
        >
          All Levels
        </button>
        <button
          type="button"
          className={`roadmap-filter-chip ${filterDifficulty === 'beginner' ? 'active' : ''}`}
          onClick={() => setFilterDifficulty('beginner')}
        >
          Beginner
        </button>
        <button
          type="button"
          className={`roadmap-filter-chip ${filterDifficulty === 'intermediate' ? 'active' : ''}`}
          onClick={() => setFilterDifficulty('intermediate')}
        >
          Intermediate
        </button>
        <button
          type="button"
          className={`roadmap-filter-chip ${filterDifficulty === 'advanced' ? 'active' : ''}`}
          onClick={() => setFilterDifficulty('advanced')}
        >
          Advanced
        </button>
      </div>

      <div className="roadmap-cards-grid">
        {filteredActions.map((action, index) => {
          const actionId = action.skill_id || action.title || action.skill_name || `action_${index}`
          const currentStatus = learningProgress[actionId] || 'not_started'
          const diffLower = (action.difficulty || '').toLowerCase()
          const diffClass = diffLower.includes('begin')
            ? 'beginner'
            : diffLower.includes('adv')
              ? 'advanced'
              : 'intermediate'

          const skillLower = (action.skill_name || '').toLowerCase()
          const domainIcon = skillLower.includes('sql') || skillLower.includes('data')
            ? '🗄'
            : skillLower.includes('python') || skillLower.includes('learn')
              ? '⚡'
              : skillLower.includes('power') || skillLower.includes('visual')
                ? '📊'
                : '🎯'

          return (
            <article className="roadmap-card" key={actionId}>
              <div>
                <div className="roadmap-card-header">
                  <span className="roadmap-card-domain-badge">
                    <span aria-hidden="true">{domainIcon}</span>
                    {action.skill_name || 'Core Skill'}
                  </span>
                  <span className={`roadmap-badge-difficulty ${diffClass}`}>
                    {action.difficulty || 'Intermediate'}
                  </span>
                </div>

                <h3 className="roadmap-card-title">
                  {action.resource_title || action.title || action.skill_name}
                </h3>

                <p className="roadmap-card-desc">
                  {action.resource_description || action.description || action.explanation || 'Curated learning activity targeting role-specific competencies.'}
                </p>

                <div className="roadmap-market-stats">
                  <div className="roadmap-market-stats-row">
                    <span>Market demand:</span>
                    <strong>{action.market_evidence_status || 'Strong demand in UK listings'}</strong>
                  </div>
                  {action.market_jobs_with_skill != null && (
                    <div className="roadmap-market-stats-row">
                      <span>Observed listings:</span>
                      <strong>{action.market_jobs_with_skill} of {action.market_relevant_jobs_total || 251} jobs</strong>
                    </div>
                  )}
                  {action.priority_score != null && (
                    <div className="roadmap-market-stats-row">
                      <span>Priority score:</span>
                      <strong>{action.priority_score} / 100</strong>
                    </div>
                  )}
                  {action.access_type && (
                    <div className="roadmap-market-stats-row">
                      <span>Resource type:</span>
                      <span>{action.access_type}</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <div className="roadmap-status-toggles" role="group" aria-label="Learning status">
                  <button
                    type="button"
                    className={`roadmap-status-btn ${currentStatus === 'not_started' ? 'active not_started' : ''}`}
                    onClick={() => onToggleProgress(actionId, 'not_started')}
                  >
                    ○ Not Started
                  </button>
                  <button
                    type="button"
                    className={`roadmap-status-btn ${currentStatus === 'in_progress' ? 'active in_progress' : ''}`}
                    onClick={() => onToggleProgress(actionId, 'in_progress')}
                  >
                    ◐ In Progress
                  </button>
                  <button
                    type="button"
                    className={`roadmap-status-btn ${currentStatus === 'completed' ? 'active completed' : ''}`}
                    onClick={() => onToggleProgress(actionId, 'completed')}
                  >
                    ● Completed
                  </button>
                </div>

                <div className="roadmap-card-actions">
                  {action.resource_url ? (
                    <a
                      className="roadmap-link-btn"
                      href={action.resource_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Open resource ↗
                    </a>
                  ) : (
                    <span style={{ fontSize: '11px', color: '#939aab' }}>Curated learning guide</span>
                  )}
                  <button
                    type="button"
                    className="roadmap-practice-btn"
                    onClick={() => onNavigate('Project Workspace')}
                  >
                    Practise in Projects →
                  </button>
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

function ProjectWorkspace({
  targetRole,
  onTargetRoleChange,
  candidateProfile,
  projects,
  onUpdateProjectEvidence,
  onUpdateProjectStatus,
  onNavigate,
}) {
  const [selectedProjectId, setSelectedProjectId] = useState(null)
  const [evidenceRepoUrl, setEvidenceRepoUrl] = useState('')
  const [evidenceSummary, setEvidenceSummary] = useState('')
  const [evidenceMetrics, setEvidenceMetrics] = useState('')
  const [formError, setFormError] = useState('')

  const activeProject = projects.find((p) => p.id === selectedProjectId)

  function openEvidenceForm(proj) {
    setSelectedProjectId(proj.id)
    setEvidenceRepoUrl(proj.evidence?.repoUrl || '')
    setEvidenceSummary(proj.evidence?.summary || '')
    setEvidenceMetrics(proj.evidence?.metrics || '')
    setFormError('')
  }

  function handleSaveEvidence(e) {
    e.preventDefault()
    if (!evidenceRepoUrl.trim()) {
      setFormError('Please provide a repository URL (e.g. GitHub link).')
      return
    }
    if (!evidenceSummary.trim()) {
      setFormError('Please provide a brief technical summary of your implementation.')
      return
    }

    onUpdateProjectEvidence(targetRole, selectedProjectId, {
      repoUrl: evidenceRepoUrl.trim(),
      summary: evidenceSummary.trim(),
      metrics: evidenceMetrics.trim(),
      submittedAt: new Date().toLocaleDateString(),
    })

    setSelectedProjectId(null)
  }

  const submittedCount = projects.filter((p) => p.status === 'submitted').length
  const inProgressCount = projects.filter((p) => p.status === 'in_progress').length

  return (
    <section className="projects-page">
      <button
        type="button"
        className="workspace-back-link"
        onClick={() => onNavigate('Overview')}
      >
        ← Back to overview
      </button>

      <div className="career-intro">
        <span className="eyebrow">PRACTICAL PORTFOLIO &amp; EVIDENCE</span>
        <h1>Turn knowledge into evidence.</h1>
        <p>
          Recruiters and hiring managers look for verifiable proof, not just keywords on a CV.
          Complete role-aligned projects, submit your repository links, and build evidence toward your readiness score.
        </p>
      </div>

      <div className="roadmap-summary-bar">
        <article className="roadmap-summary-card">
          <span>Target Role</span>
          <strong>{targetRole}</strong>
          <small>Role curriculum</small>
        </article>
        <article className="roadmap-summary-card">
          <span>Recommended Projects</span>
          <strong>{projects.length}</strong>
          <small>Portfolio projects</small>
        </article>
        <article className="roadmap-summary-card">
          <span>In Progress</span>
          <strong style={{ color: '#0d6efd' }}>{inProgressCount}</strong>
          <small>Currently building</small>
        </article>
        <article className="roadmap-summary-card">
          <span>Evidence Submitted</span>
          <strong style={{ color: '#198754' }}>{submittedCount}</strong>
          <small>Ready for readiness evaluation</small>
        </article>
      </div>

      {activeProject && (
        <section className="evidence-submission-panel" role="region" aria-label="Submit project evidence">
          <h3>Submit Evidence: {activeProject.title}</h3>
          <p>
            Provide your public code repository, notebook, or dashboard link alongside a brief summary of methods and results.
            This evidence directly verifies the skills exercised in this project.
          </p>

          <form onSubmit={handleSaveEvidence} className="evidence-form-grid">
            {formError && (
              <div className="career-feedback-banner is-error" style={{ margin: '0 0 10px' }}>
                <span className="banner-icon">⚠</span>
                <div className="career-feedback-content">
                  <p>{formError}</p>
                </div>
              </div>
            )}

            <div className="evidence-input-group">
              <label>Public GitHub Repository or Project URL *</label>
              <input
                type="url"
                placeholder="https://github.com/username/project-repo"
                value={evidenceRepoUrl}
                onChange={(e) => setEvidenceRepoUrl(e.target.value)}
                required
              />
            </div>

            <div className="evidence-input-group">
              <label>Technical Implementation Summary *</label>
              <textarea
                rows="3"
                placeholder="Describe your data pipeline, tools used, data cleaning techniques, modeling algorithms, or dashboard architecture..."
                value={evidenceSummary}
                onChange={(e) => setEvidenceSummary(e.target.value)}
                required
              />
            </div>

            <div className="evidence-input-group">
              <label>Key Results &amp; Performance Metrics (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Achieved 0.88 ROC-AUC, optimized query latency by 40%, built 4 interactive dashboard views"
                value={evidenceMetrics}
                onChange={(e) => setEvidenceMetrics(e.target.value)}
              />
            </div>

            <div className="evidence-form-actions">
              <button type="submit" className="workspace-primary-button">
                Save &amp; Submit Evidence <span>✓</span>
              </button>
              <button
                type="button"
                className="button-subtle"
                onClick={() => setSelectedProjectId(null)}
                style={{ background: 'transparent', border: '1px solid #dcd4f6', borderRadius: '8px', padding: '10px 16px', fontSize: '12px', fontWeight: 700 }}
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      <div className="projects-grid">
        {projects.map((proj) => {
          const isSubmitted = proj.status === 'submitted'

          return (
            <article className="project-card" key={proj.id}>
              <div>
                <div className="project-card-header">
                  <span className="project-domain-tag">
                    <span>◈</span> {proj.domain}
                  </span>
                  <span className={`project-status-badge ${proj.status}`}>
                    {proj.status === 'submitted'
                      ? '✓ Evidence Submitted'
                      : proj.status === 'in_progress'
                        ? 'In Progress'
                        : 'Suggested'}
                  </span>
                </div>

                <h3>{proj.title}</h3>
                <p className="project-card-objective">{proj.objective}</p>

                <div className="project-skills-list">
                  {proj.skills.map((skill) => (
                    <span className="project-skill-pill" key={skill}>
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="project-deliverables-box">
                  <strong>Expected Artifacts &amp; Deliverables:</strong>
                  <ul>
                    {proj.deliverables.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>

                {isSubmitted && proj.evidence && (
                  <div className="project-evidence-status-box">
                    <strong>Verified Submission:</strong>
                    <div style={{ marginTop: '4px' }}>
                      Repository: <a href={proj.evidence.repoUrl} target="_blank" rel="noopener noreferrer">{proj.evidence.repoUrl}</a>
                    </div>
                    {proj.evidence.metrics && (
                      <div style={{ marginTop: '4px' }}>
                        Metrics: <em>{proj.evidence.metrics}</em>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="project-card-footer">
                <select
                  value={proj.status}
                  onChange={(e) => onUpdateProjectStatus(targetRole, proj.id, e.target.value)}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '8px',
                    border: '1px solid #d5d8e2',
                    fontSize: '11px',
                    fontWeight: 600,
                    background: '#fff',
                  }}
                >
                  <option value="suggested">Status: Suggested</option>
                  <option value="in_progress">Status: In Progress</option>
                  <option value="submitted">Status: Evidence Submitted</option>
                </select>

                <button
                  type="button"
                  className="project-submit-btn"
                  onClick={() => openEvidenceForm(proj)}
                >
                  {isSubmitted ? 'Update Evidence ↗' : 'Submit Evidence ↗'}
                </button>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

function ReadinessReport({
  targetRole,
  candidateProfile,
  careerPlan,
  projects,
  learningProgress,
  onNavigate,
}) {
  const detectedSkillsCount = (candidateProfile?.skills || []).length
  const p1Score = candidateProfile ? Math.min(25, Math.max(10, detectedSkillsCount * 2)) : 0

  const actions = careerPlan?.learning_actions || []
  const completedActions = actions.filter((a) => learningProgress[a.skill_id || a.title || a.skill_name] === 'completed').length
  const inProgressActions = actions.filter((a) => learningProgress[a.skill_id || a.title || a.skill_name] === 'in_progress').length
  const p2Score = actions.length > 0
    ? Math.min(25, Math.round(((completedActions * 1.0 + inProgressActions * 0.4) / actions.length) * 25))
    : candidateProfile ? 8 : 0

  const submittedProjects = projects.filter((p) => p.status === 'submitted').length
  const inProgressProjects = projects.filter((p) => p.status === 'in_progress').length
  const p3Score = projects.length > 0
    ? Math.min(35, Math.round(((submittedProjects * 1.0 + inProgressProjects * 0.35) / projects.length) * 35))
    : 0

  const gaps = careerPlan?.skill_gaps || []
  const highDemandGaps = gaps.filter((g) => (g.priority_score || 0) >= 80).length
  const p4Score = gaps.length > 0
    ? Math.min(15, Math.round(((gaps.length - highDemandGaps * 0.5) / gaps.length) * 15))
    : candidateProfile ? 6 : 0

  const totalReadinessScore = Math.min(100, p1Score + p2Score + p3Score + p4Score)

  let stageName = 'Stage 1: Exploration & Foundations'
  let stageDescription =
    'Your career profile is taking shape. Identify key skill gaps and start building portfolio project evidence.'

  if (totalReadinessScore >= 85) {
    stageName = 'Stage 4: Role-Ready Candidate'
    stageDescription =
      'Demonstrated high evidence across CV, completed learning roadmap items, and submitted GitHub project repositories.'
  } else if (totalReadinessScore >= 65) {
    stageName = 'Stage 3: Evidence-Backed Portfolio'
    stageDescription =
      'Practical evidence has been submitted. Complete remaining high-priority skills to reach full role readiness.'
  } else if (totalReadinessScore >= 35) {
    stageName = 'Stage 2: Active Skill Building'
    stageDescription =
      'Foundations established. Focus on completing practical projects to transform skill mentions into verified evidence.'
  }

  const radius = 50
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (totalReadinessScore / 100) * circumference

  return (
    <section className="readiness-page">
      <button
        type="button"
        className="workspace-back-link"
        onClick={() => onNavigate('Overview')}
      >
        ← Back to overview
      </button>

      <div className="readiness-hero-card">
        <div className="readiness-hero-copy">
          <span className="eyebrow" style={{ color: '#d8d0ff' }}>EVIDENCE-BASED ASSESSMENT</span>
          <h2>{targetRole} Career Readiness</h2>
          <p>{stageDescription}</p>
          <span className="readiness-stage-chip">
            ● {stageName}
          </span>
        </div>

        <div className="readiness-meter-wrapper">
          <div className="readiness-circle-meter">
            <svg className="readiness-circle-svg" viewBox="0 0 120 120">
              <circle
                className="readiness-circle-bg"
                cx="60"
                cy="60"
                r={radius}
              />
              <circle
                className="readiness-circle-bar"
                cx="60"
                cy="60"
                r={radius}
                style={{
                  strokeDasharray: circumference,
                  strokeDashoffset: strokeDashoffset,
                  stroke: totalReadinessScore >= 80 ? '#48bb78' : totalReadinessScore >= 60 ? '#4299e1' : totalReadinessScore >= 35 ? '#38b2ac' : '#9f7aea',
                }}
              />
            </svg>
            <div className="readiness-meter-text">
              <strong>{totalReadinessScore}%</strong>
              <small>Readiness</small>
            </div>
          </div>
        </div>
      </div>

      <div className="readiness-pillars-grid">
        <article className="readiness-pillar-card">
          <div>
            <div className="readiness-pillar-header">
              <span className="readiness-pillar-icon cv">◎</span>
              <span className="readiness-pillar-weight">Weight: 25%</span>
            </div>
            <strong>CV Skill Profile</strong>
            <p>
              {candidateProfile
                ? `${detectedSkillsCount} skill mentions detected in CV text. Mentions remain unverified.`
                : 'Upload CV to establish starting profile.'}
            </p>
          </div>
          <div className="readiness-pillar-stat">
            <span>Points Contributed:</span>
            <span>{p1Score} / 25 pts</span>
          </div>
        </article>

        <article className="readiness-pillar-card">
          <div>
            <div className="readiness-pillar-header">
              <span className="readiness-pillar-icon learning">↗</span>
              <span className="readiness-pillar-weight">Weight: 25%</span>
            </div>
            <strong>Learning Milestones</strong>
            <p>
              {actions.length > 0
                ? `${completedActions} of ${actions.length} learning actions completed (${inProgressActions} in progress).`
                : 'Generate career plan in My Career.'}
            </p>
          </div>
          <div className="readiness-pillar-stat">
            <span>Points Contributed:</span>
            <span>{p2Score} / 25 pts</span>
          </div>
        </article>

        <article className="readiness-pillar-card">
          <div>
            <div className="readiness-pillar-header">
              <span className="readiness-pillar-icon projects">◇</span>
              <span className="readiness-pillar-weight">Weight: 35%</span>
            </div>
            <strong>Practical Project Evidence</strong>
            <p>
              {submittedProjects > 0
                ? `${submittedProjects} project repository submitted with code evidence.`
                : 'Submit code repositories in Project Workspace to demonstrate skills.'}
            </p>
          </div>
          <div className="readiness-pillar-stat">
            <span>Points Contributed:</span>
            <span>{p3Score} / 35 pts</span>
          </div>
        </article>

        <article className="readiness-pillar-card">
          <div>
            <div className="readiness-pillar-header">
              <span className="readiness-pillar-icon market">✳</span>
              <span className="readiness-pillar-weight">Weight: 15%</span>
            </div>
            <strong>Market Skill Coverage</strong>
            <p>
              Aligned against 251 validated Adzuna UK job postings and ESCO/O*NET taxonomy priorities.
            </p>
          </div>
          <div className="readiness-pillar-stat">
            <span>Points Contributed:</span>
            <span>{p4Score} / 15 pts</span>
          </div>
        </article>
      </div>

      <div className="readiness-table-card">
        <h3>Explainable Evidence Breakdown</h3>
        <p>
          GradPath readiness is computed from verifiable evidence rather than speculative prediction. Every contributing factor is documented below:
        </p>

        <div style={{ overflowX: 'auto' }}>
          <table className="readiness-breakdown-table">
            <thead>
              <tr>
                <th>Evaluation Dimension</th>
                <th>Observed Evidence</th>
                <th>Validation Status</th>
                <th>Score Contribution</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>1. CV Profile &amp; Experience</strong></td>
                <td>{candidateProfile ? `${detectedSkillsCount} skill keywords identified` : 'No CV uploaded'}</td>
                <td>{candidateProfile ? 'Text Matched (Unverified)' : 'Pending'}</td>
                <td><strong>{p1Score} / 25 pts</strong></td>
              </tr>
              <tr>
                <td><strong>2. Learning Roadmap Actions</strong></td>
                <td>{actions.length > 0 ? `${completedActions} completed, ${inProgressActions} in progress` : 'Roadmap pending'}</td>
                <td>{completedActions > 0 ? 'Documented Study' : 'Not Started'}</td>
                <td><strong>{p2Score} / 25 pts</strong></td>
              </tr>
              <tr>
                <td><strong>3. Practical Project Evidence</strong></td>
                <td>{submittedProjects > 0 ? `${submittedProjects} repository links verified` : '0 repositories submitted'}</td>
                <td>{submittedProjects > 0 ? 'Evidence Submitted' : 'Action Required'}</td>
                <td><strong>{p3Score} / 35 pts</strong></td>
              </tr>
              <tr>
                <td><strong>4. Job-Market Demand Coverage</strong></td>
                <td>Priority coverage against UK Adzuna postings for {targetRole}</td>
                <td>Heuristic Alignment</td>
                <td><strong>{p4Score} / 15 pts</strong></td>
              </tr>
              <tr style={{ background: '#f8f9fd', fontWeight: 700 }}>
                <td>Total Verified Readiness</td>
                <td colSpan="2">{stageName}</td>
                <td style={{ color: '#286f62', fontSize: '14px' }}>{totalReadinessScore} / 100 pts</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="readiness-table-card">
        <h3>Recommended Next Steps to Increase Readiness</h3>
        <p>High-impact actions to build verified evidence for {targetRole}:</p>

        <div className="readiness-action-list">
          {submittedProjects === 0 && (
            <div className="readiness-action-item">
              <span className="readiness-action-num">01</span>
              <div className="readiness-action-content">
                <strong>Submit evidence for your first project</strong>
                <p>
                  Visit <button type="button" onClick={() => onNavigate('Project Workspace')} style={{ background: 'none', border: 'none', color: '#7160b5', fontWeight: 700, padding: 0, textDecoration: 'underline' }}>Project Workspace</button> and link your GitHub repository. Project evidence provides up to 35 readiness points.
                </p>
              </div>
            </div>
          )}

          {completedActions === 0 && (
            <div className="readiness-action-item">
              <span className="readiness-action-num">02</span>
              <div className="readiness-action-content">
                <strong>Complete a high-priority learning action</strong>
                <p>
                  Mark your learning progress in the <button type="button" onClick={() => onNavigate('Learning Roadmap')} style={{ background: 'none', border: 'none', color: '#7160b5', fontWeight: 700, padding: 0, textDecoration: 'underline' }}>Learning Roadmap</button> to track your intentional skill acquisition.
                </p>
              </div>
            </div>
          )}

          {!candidateProfile && (
            <div className="readiness-action-item">
              <span className="readiness-action-num">03</span>
              <div className="readiness-action-content">
                <strong>Upload your CV for baseline skill extraction</strong>
                <p>
                  Start by analyzing your CV in <button type="button" onClick={() => onNavigate('My Career')} style={{ background: 'none', border: 'none', color: '#7160b5', fontWeight: 700, padding: 0, textDecoration: 'underline' }}>My Career</button> to detect your existing skills.
                </p>
              </div>
            </div>
          )}

          <div className="readiness-action-item">
            <span className="readiness-action-num">✓</span>
            <div className="readiness-action-content">
              <strong>Keep evidence updated</strong>
              <p>
                Each submitted code repository and documented metric directly reinforces your portfolio credibility.
              </p>
            </div>
          </div>
        </div>
      </div>

      <p className="workspace-footnote">
        GradPath readiness assessments are explainable heuristics based on documented evidence and role taxonomies.
        They reflect candidate portfolio preparation and do not constitute an automated hiring guarantee.
      </p>
    </section>
  )
}

function Workspace({ onNavigate, onLogout, currentUser }) {
  const [activePage, setActivePage] = useState('Overview')
  const [targetRole, setTargetRole] = useState('Data Analyst')
  const [candidateProfile, setCandidateProfile] = useState(null)
  const [sharedCareerPlan, setSharedCareerPlan] = useState(null)
  const [userProjects, setUserProjects] = useState({
    'Data Analyst': DEFAULT_ANALYST_PROJECTS,
    'Data Scientist': DEFAULT_SCIENTIST_PROJECTS,
  })
  const [learningProgress, setLearningProgress] = useState({})

  const userKey = currentUser?.user_id || 'guest'
  const projectStorageKey = `gradpath_projects_${userKey}`
  const learningStorageKey = `gradpath_learning_${userKey}`
  const profileStorageKey = `gradpath_active_profile_${userKey}`
  const careerPlanStorageKey = `gradpath_active_plan_${userKey}`

  // Restore user state when user logs in or switches
  useEffect(() => {
    try {
      const savedProjects = localStorage.getItem(projectStorageKey)
      if (savedProjects) {
        setUserProjects(JSON.parse(savedProjects))
      } else {
        setUserProjects({
          'Data Analyst': DEFAULT_ANALYST_PROJECTS,
          'Data Scientist': DEFAULT_SCIENTIST_PROJECTS,
        })
      }

      const savedProgress = localStorage.getItem(learningStorageKey)
      if (savedProgress) {
        setLearningProgress(JSON.parse(savedProgress))
      } else {
        setLearningProgress({})
      }

      const savedProfile = localStorage.getItem(profileStorageKey)
      if (savedProfile) {
        setCandidateProfile(JSON.parse(savedProfile))
      } else {
        setCandidateProfile(null)
      }

      const savedPlan = localStorage.getItem(careerPlanStorageKey)
      if (savedPlan) {
        setSharedCareerPlan(JSON.parse(savedPlan))
      } else {
        setSharedCareerPlan(null)
      }
    } catch {
      // Ignore local storage error
    }
  }, [userKey])

  function handleProfileChange(newProfile) {
    setCandidateProfile(newProfile)
    try {
      if (newProfile) {
        localStorage.setItem(profileStorageKey, JSON.stringify(newProfile))
      } else {
        localStorage.removeItem(profileStorageKey)
      }
    } catch {
      // Storage quota
    }
  }

  function handleCareerPlanChange(newPlan) {
    setSharedCareerPlan(newPlan)
    try {
      if (newPlan) {
        localStorage.setItem(careerPlanStorageKey, JSON.stringify(newPlan))
      } else {
        localStorage.removeItem(careerPlanStorageKey)
      }
    } catch {
      // Storage quota
    }
  }

  function handleToggleLearningProgress(actionId, newStatus) {
    setLearningProgress((prev) => {
      const updated = {
        ...prev,
        [actionId]: newStatus,
      }
      try {
        localStorage.setItem(learningStorageKey, JSON.stringify(updated))
      } catch {
        // Storage quota
      }
      return updated
    })
  }

  function handleUpdateProjectEvidence(role, projectId, evidenceData) {
    setUserProjects((prev) => {
      const updated = {
        ...prev,
        [role]: (prev[role] || []).map((proj) =>
          proj.id === projectId
            ? {
                ...proj,
                status: 'submitted',
                evidence: evidenceData,
              }
            : proj,
        ),
      }
      try {
        localStorage.setItem(projectStorageKey, JSON.stringify(updated))
      } catch {
        // Storage quota
      }
      return updated
    })
  }

  function handleUpdateProjectStatus(role, projectId, newStatus) {
    setUserProjects((prev) => {
      const updated = {
        ...prev,
        [role]: (prev[role] || []).map((proj) =>
          proj.id === projectId ? { ...proj, status: newStatus } : proj,
        ),
      }
      try {
        localStorage.setItem(projectStorageKey, JSON.stringify(updated))
      } catch {
        // Storage quota
      }
      return updated
    })
  }

  const projectIdeas =
  targetRole === 'Data Scientist'
    ? [
        {
          title: 'Customer Churn Prediction',
          description:
            'Build and evaluate a machine learning model to identify customers likely to leave.',
          skills: ['Python', 'Pandas', 'scikit-learn'],
        },
        {
          title: 'Exploratory Data Analysis',
          description:
            'Explore a real-world dataset, identify patterns, and communicate findings through visualizations.',
          skills: ['Python', 'Pandas', 'Matplotlib'],
        },
        {
          title: 'Model Evaluation Dashboard',
          description:
            'Compare model performance using evaluation metrics and present the results clearly.',
          skills: ['Python', 'scikit-learn', 'Power BI'],
        },
      ]
    : [
        {
          title: 'Sales Performance Dashboard',
          description:
            'Analyze sales trends and build an interactive dashboard to communicate business insights.',
          skills: ['SQL', 'Power BI', 'Data Analysis'],
        },
        {
          title: 'Customer Insights Analysis',
          description:
            'Explore customer behavior and summarize useful business insights from a dataset.',
          skills: ['Python', 'Pandas', 'SQL'],
        },
        {
          title: 'Business KPI Reporting',
          description:
            'Create a repeatable reporting workflow for tracking key performance indicators.',
          skills: ['SQL', 'Power BI', 'Excel'],
        },
      ]

  const navigation = [
    { group: 'WORKSPACE', items: [
      { name: 'Overview', icon: '←' },
      { name: 'My Career', icon: '◎' },
      { name: 'Learning Roadmap', icon: '↗' },
      { name: 'Project Workspace', icon: '◇' },
    ] },
    { group: 'YOUR PROGRESS', items: [
      { name: 'Readiness Report', icon: '◇' },
    ] },
  ]

  const pageDescriptions = {
    'My Career': {
      eyebrow: 'YOUR PROFESSIONAL PROFILE',
      title: 'Start with your experience.',
      description: 'Upload your CV to extract your profile and review the skills identified in it.',
      action: 'Continue to CV profile',
    },
    'Learning Roadmap': {
      eyebrow: 'YOUR LEARNING PLAN',
      title: 'Make learning intentional.',
      description: 'Explore role-specific skill gaps and learning recommendations based on your profile.',
      action: 'Explore learning',
    },
    'Project Workspace': {
      eyebrow: 'PRACTICE AND BUILD',
      title: 'Turn knowledge into evidence.',
      description: 'Discover relevant projects, track your progress and record the work you complete.',
      action: 'Explore projects',
    },
    'Readiness Report': {
      eyebrow: 'YOUR EVIDENCE-BASED PROGRESS',
      title: 'Understand what your progress means.',
      description: 'Readiness reporting will use available profile, assessment and project evidence. No score is available until your data is connected.',
      action: 'Review your profile',
    },
  }

  const isOverview = activePage === 'Overview'
  const pageInfo = pageDescriptions[activePage]

  function navigateTo(page) {
    setActivePage(page)
  }

  return (
    <div className="workspace-shell">
      <aside className="workspace-sidebar">
        <button
          type="button"
          className="workspace-brand"
          onClick={() => navigateTo('Overview')}
          aria-label="GradPath overview"
        >
          <span className="brand-mark">g<span>.</span></span>
          <span>gradpath</span>
        </button>

        <div className="workspace-profile">
          <span className="workspace-avatar">G</span>
          <div>
            <strong>{currentUser?.username || currentUser?.email || 'My workspace'}</strong>
            <small>Career development</small>
          </div>
        </div>

        <nav className="workspace-nav" aria-label="Workspace navigation">
          {navigation.map((section) => (
            <div className="workspace-nav-group" key={section.group}>
              <span className="workspace-nav-label">{section.group}</span>
              {section.items.map((item) => (
                <button
                  type="button"
                  key={item.name}
                  className={`workspace-nav-item ${activePage === item.name ? 'active' : ''}`}
                  onClick={() => navigateTo(item.name)}
                  aria-current={activePage === item.name ? 'page' : undefined}
                >
                  <span className="workspace-nav-icon" aria-hidden="true">{item.icon}</span>
                  <span>{item.name}</span>
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="workspace-sidebar-bottom">
          <div className="workspace-help">
            <span className="workspace-help-icon">✳</span>
            <strong>Small steps count.</strong>
            <p>Build your career plan one meaningful action at a time.</p>
          </div>
          <button className="workspace-logout" type="button" onClick={onLogout}>
            <span aria-hidden="true">↗</span> Return to landing page
          </button>
        </div>
      </aside>

      <main className="workspace-main">
        <header className="workspace-topbar">
          <div className="workspace-breadcrumb">
            <span>Workspace</span><span>/</span><strong>{activePage}</strong>
          </div>
          <div className="workspace-topbar-right">
            <span className="workspace-prototype-pill"><i /> Prototype mode</span>
            <span className="workspace-top-avatar">G</span>
          </div>
        </header>

        <div className="workspace-content">
          
          {isOverview ? (
            <>
              {(() => {
                const skills = candidateProfile?.skills ?? []
                const learningActions = sharedCareerPlan?.learning_actions ?? []
                const skillGaps = sharedCareerPlan?.skill_gaps ?? []
                const hasProfile = Boolean(candidateProfile)

                return (
                  <>
                    <section className="workspace-welcome">
                      <div>
                        <span className="eyebrow">YOUR CAREER, WITH MORE CLARITY</span>
                        <h1>Your next chapter starts here.</h1>
                        <p>
                          {hasProfile
                            ? 'Your profile is taking shape. Keep building evidence for your target role.'
                            : 'A little progress today can give you a clearer direction tomorrow.'}
                        </p>
                      </div>
                      <div className="welcome-decoration" aria-hidden="true">
                        <span className="welcome-orbit orbit-a" />
                        <span className="welcome-orbit orbit-b" />
                        <span className="welcome-star">✳</span>
                      </div>
                    </section>

                    <section className="workspace-role-card">
                      <div className="workspace-role-copy">
                        <span className="eyebrow">YOUR TARGET ROLE</span>
                        <h2>What are you working towards?</h2>
                        <p>Choose a role to shape your future profile and learning plan.</p>
                      </div>
                      <label className="workspace-role-select">
                        <span>Career goal</span>
                        <select
                          value={targetRole}
                          onChange={(event) => {
                          setTargetRole(event.target.value)
                          setSharedCareerPlan(null)
                        }}
                        >
                          <option>Data Analyst</option>
                          <option>Data Scientist</option>
                        </select>
                      </label>
                    </section>

                    <div className="workspace-section-heading">
                      <div>
                        <span className="eyebrow">YOUR STARTING POINT</span>
                        <h2>Build your foundation.</h2>
                      </div>
                      <span className="workspace-status-label">
                        {hasProfile ? 'Profile analyzed' : 'Profile not started'}
                      </span>
                    </div>

                    <section className="workspace-stat-grid">
                      <article className="workspace-stat-card">
                        <span className="workspace-stat-icon lavender">◎</span>
                        <span className="workspace-stat-label">CV PROFILE</span>
                        <strong>{hasProfile ? 'Analyzed' : 'Not started'}</strong>
                        <p>
                          {hasProfile
                            ? `${skills.length} skill${skills.length === 1 ? '' : 's'} detected in your profile.`
                            : 'Review your experience and extracted skills.'}
                        </p>
                        <button type="button" onClick={() => navigateTo('My Career')}>
                          {hasProfile ? 'Review profile' : 'Set up profile'} <span>→</span>
                        </button>
                      </article>

                      <article className="workspace-stat-card">
                        <span className="workspace-stat-icon teal">↗</span>
                        <span className="workspace-stat-label">LEARNING ROADMAP</span>
                        <strong>
                          {sharedCareerPlan
                            ? `${learningActions.length} learning actions`
                            : 'Not generated'}
                        </strong>
                        <p>
                          {sharedCareerPlan
                            ? `${skillGaps.length} skill-gap records in your current plan.`
                            : 'Generate a career plan to see learning recommendations.'}
                        </p>
                        <button type="button" onClick={() => navigateTo('Learning Roadmap')}>
                          View roadmap <span>→</span>
                        </button>
                      </article>

                      <article className="workspace-stat-card">
                        <span className="workspace-stat-icon violet">◇</span>
                        <span className="workspace-stat-label">PROJECT WORKSPACE</span>
                        <strong>Not started</strong>
                        <p>Explore projects to practise and demonstrate your skills.</p>
                        <button type="button" onClick={() => navigateTo('Project Workspace')}>
                          Explore projects <span>→</span>
                        </button>
                      </article>
                    </section>
                    
                    
                    <section className="workspace-panel workspace-journey-panel">
                      <div className="workspace-panel-heading">
                        <div>
                          <span className="eyebrow">YOUR CAREER JOURNEY</span>
                          <h2>Small steps, meaningful progress.</h2>
                        </div>
                      </div>

                      <p className="workspace-journey-description">
                        Follow your progress from your CV profile to practical
                        evidence of your skills.
                      </p>

                      <div className="workspace-journey-steps">
                        <article className={`workspace-journey-step ${hasProfile ? 'is-complete' : 'is-current'}`}>
                          <span className="workspace-journey-number">
                            {hasProfile ? '✓' : '01'}
                          </span>
                          <div>
                            <strong>Build your profile</strong>
                            <p>
                              {hasProfile
                                ? 'Your CV profile is available.'
                                : 'Start by analyzing your CV.'}
                            </p>
                            {!hasProfile && (
                              <button type="button" onClick={() => navigateTo('My Career')}>
                                Analyze CV →
                              </button>
                            )}
                          </div>
                        </article>

                        <article className={`workspace-journey-step ${sharedCareerPlan ? 'is-complete' : hasProfile ? 'is-current' : ''}`}>
                          <span className="workspace-journey-number">
                            {sharedCareerPlan ? '✓' : '02'}
                          </span>
                          <div>
                            <strong>Create your learning plan</strong>
                            <p>
                              {sharedCareerPlan
                                ? 'Your career plan is available.'
                                : hasProfile
                                  ? 'Generate recommendations for your target role.'
                                  : 'Your plan can follow your CV analysis.'}
                            </p>
                            {!sharedCareerPlan && (
                              <button type="button" onClick={() => navigateTo('My Career')}>
                                {hasProfile ? 'Continue' : 'Get started'} →
                              </button>
                            )}
                          </div>
                        </article>

                        <article className="workspace-journey-step">
                          <span className="workspace-journey-number">03</span>
                          <div>
                            <strong>Build project evidence</strong>
                            <p>
                              Explore projects that help demonstrate your skills.
                            </p>
                            <button type="button" onClick={() => navigateTo('Project Workspace')}>
                              Explore projects →
                            </button>
                          </div>
                        </article>

                        <article className="workspace-journey-step">
                          <span className="workspace-journey-number">04</span>
                          <div>
                            <strong>Review your readiness</strong>
                            <p>
                              Review available evidence and identify what still needs work.
                            </p>
                            <button type="button" onClick={() => navigateTo('Readiness Report')}>
                              View report →
                            </button>
                          </div>
                        </article>
                      </div>
                    </section>


                    <section className="workspace-bottom-grid">
                      <article className="workspace-panel workspace-readiness-panel">
                        <div className="workspace-panel-heading">
                          <div>
                            <span className="eyebrow">READINESS OVERVIEW</span>
                            <h2>Evidence before scores.</h2>
                          </div>
                          <span className="workspace-panel-symbol">○</span>
                        </div>
                        
                        <div className="workspace-readiness-content">
                          <p className="workspace-readiness-intro">
                            Readiness should reflect evidence, not just the
                            skills mentioned in a CV.
                          </p>

                          <div className="workspace-evidence-list">
                            <div className="workspace-evidence-item">
                              <span className="workspace-evidence-icon">01</span>
                              <div>
                                <strong>CV skill mentions</strong>
                                <p>
                                  {hasProfile
                                    ? `${skills.length} skills detected; mentions remain unverified.`
                                    : 'Analyze your CV to identify relevant skills.'}
                                </p>
                              </div>
                              <span className="workspace-evidence-state">
                                {hasProfile ? 'Available' : 'Pending'}
                              </span>
                            </div>

                            <div className="workspace-evidence-item">
                              <span className="workspace-evidence-icon">02</span>
                              <div>
                                <strong>Learning progress</strong>
                                <p>
                                  {sharedCareerPlan
                                    ? `${learningActions.length} learning actions in your current plan.`
                                    : 'Generate a learning plan to identify next steps.'}
                                </p>
                              </div>
                              <span className="workspace-evidence-state">
                                {sharedCareerPlan ? 'Available' : 'Pending'}
                              </span>
                            </div>

                            <div className="workspace-evidence-item">
                              <span className="workspace-evidence-icon">03</span>
                              <div>
                                <strong>Practical project evidence</strong>
                                <p>
                                  Record completed projects and supporting evidence
                                  before treating skills as demonstrated.
                                </p>
                              </div>
                              <span className="workspace-evidence-state">
                                To build
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => navigateTo('Readiness Report')}
                          >
                            Review readiness <span>→</span>
                          </button>
                        </div>

                      </article>

                      <article className="workspace-panel workspace-next-panel">
                        <span className="eyebrow">YOUR NEXT STEP</span>
                        <div className="workspace-next-icon">✳</div>
                        
                        <h2>
                          {!hasProfile
                            ? 'Start with your CV.'
                            : !sharedCareerPlan
                              ? 'Turn your profile into a plan.'
                              : learningActions.length > 0
                                ? 'Take your next learning step.'
                                : 'Explore practical projects.'}
                        </h2>
                        <p>
                          {!hasProfile
                            ? 'Upload your CV to build a starting profile and identify the skills mentioned in it.'
                            : !sharedCareerPlan
                              ? 'Generate a learning plan for your selected role to explore skill gaps and relevant learning resources.'
                              : learningActions.length > 0
                                ? `Your current plan includes ${learningActions.length} learning actions. Choose one to begin building your skills.`
                                : 'Explore role-relevant projects and start collecting evidence of what you can do.'}
                        </p>

                        <button
                          type="button"
                          className="workspace-primary-button"
                          onClick={() =>
                            navigateTo(
                              !hasProfile || !sharedCareerPlan
                                ? 'My Career'
                                : learningActions.length > 0
                                  ? 'Learning Roadmap'
                                  : 'Project Workspace',
                            )
                          }
                        >
                          {!hasProfile
                              ? 'Analyze my CV'
                              : !sharedCareerPlan
                                ? 'Create my plan'
                                : learningActions.length > 0
                                  ? 'View learning plan'
                                  : 'Explore projects'} <span>→</span>
                        </button>
                      </article>
                    </section>

                    <p className="workspace-footnote">
                      Dashboard metrics reflect verified evidence and profile data. Persistent
                      profile history, learning milestones, and project submissions are securely saved.
                    </p>
                  </>
                )
              })()}
            </>
          ) : activePage === 'My Career' ? (

            <MyCareer
                targetRole={targetRole}
                onTargetRoleChange={setTargetRole}
                currentProfile={candidateProfile}
                currentCareerPlan={sharedCareerPlan}
                onProfileChange={handleProfileChange}
                onCareerPlanChange={handleCareerPlanChange}
                currentUser={currentUser}
              />

          ) : activePage === 'Learning Roadmap' ? (
            <LearningRoadmap
              targetRole={targetRole}
              careerPlan={sharedCareerPlan}
              learningProgress={learningProgress}
              onToggleProgress={handleToggleLearningProgress}
              onNavigate={navigateTo}
            />
          ) : activePage === 'Project Workspace' ? (
            <ProjectWorkspace
              targetRole={targetRole}
              onTargetRoleChange={setTargetRole}
              candidateProfile={candidateProfile}
              projects={userProjects[targetRole] || []}
              onUpdateProjectEvidence={handleUpdateProjectEvidence}
              onUpdateProjectStatus={handleUpdateProjectStatus}
              onNavigate={navigateTo}
            />
          ) : (
            <ReadinessReport
              targetRole={targetRole}
              candidateProfile={candidateProfile}
              careerPlan={sharedCareerPlan}
              projects={userProjects[targetRole] || []}
              learningProgress={learningProgress}
              onNavigate={navigateTo}
            />
          )}


        </div>
      </main>
    </div>
  )
}


function App() {
  const [screen, setScreen] = useState('landing')
  const [currentUser, setCurrentUser] = useState(null)

  useEffect(() => {
    let isActive = true

    async function restoreSession() {
      try {
        const response = await fetch(API_BASE_URL + '/api/auth/me', {
          credentials: 'include',
        })

        if (!response.ok) return

        const data = await response.json()

        if (isActive && data.user) {
          setCurrentUser(data.user)
          setScreen('workspace')
        }
      } catch {
        // Keep the landing page available if the API is offline.
      }
    }

    restoreSession()

    return () => {
      isActive = false
    }
  }, [])

  async function handleLogout() {
    try {
      await authRequest('/api/auth/logout', {})
      setCurrentUser(null)
      setScreen('landing')
    } catch (error) {
      window.alert(error.message || 'Unable to log out. Please try again.')
    }
  }

  if (screen === 'workspace') {
    return (
      <Workspace
        onNavigate={setScreen}
        onLogout={handleLogout}
        currentUser={currentUser}
      />
    )
  }

  if (screen !== 'landing') {
    return (
      <AuthScreen
        mode={screen}
        onNavigate={setScreen}
        onContinue={(user) => { setCurrentUser(user); setScreen('workspace') }}
      />
    )
  }

  return (
    <div className="site-shell" id="home">
      <header className="site-header">
        <div className="header-inner">
          <Brand />
          <nav className="main-nav" aria-label="Main navigation">
            <a href="#how-it-works">How it works</a>
            <a href="#features">Features</a>
            <a href="#principles">Our approach</a>
          </nav>
          <div className="header-actions">

          <a
            className="login-link"
            href="#login"
            onClick={(event) => {
              event.preventDefault()
              setScreen('login')
            }}
          >
            Log in
          </a>

            <a
                className="button button-dark button-small"
                href="#register"
                onClick={(event) => {
                  event.preventDefault()
                  setScreen('register')
                }}
              >
                Get started <span>→</span>
              </a>
          </div>
        </div>
      </header>

      <main>
        <section className="hero-section">
          <div className="hero-grid">
            <div className="hero-copy">
              <div className="hero-badge">
                <span className="badge-spark">✳</span>
                A more thoughtful way to grow
              </div>
              <h1>
                Your career journey,
                <span> mapped to your </span>
                <em>potential.</em>
              </h1>
              <p className="hero-description">
                Turn what you know into what comes next. Understand your skills,
                find your gaps, and build a practical path toward your career goals.
              </p>
              <div className="hero-actions" id="get-started">
                <a className="button button-dark" href="#features">
                  Explore your possibilities <span>↗</span>
                </a>
                <a className="text-link" href="#how-it-works">
                  See how it works <span>→</span>
                </a>
              </div>
              <div className="hero-trust">
                <div className="trust-avatars" aria-hidden="true">
                  <span>M</span><span>✳</span><span>↗</span>
                </div>
                <p><strong>Built around your growth.</strong><br />Not just another list of skills.</p>
              </div>
            </div>
            <div className="hero-visual">
              <div className="visual-orbit orbit-one" />
              <div className="visual-orbit orbit-two" />
              <DashboardPreview />
            </div>
          </div>
          <div className="hero-bottom">
            <span>YOUR GOALS, MADE PRACTICAL</span>
            <span className="hero-bottom-line" />
            <span>CLARITY <b>·</b> PROGRESS <b>·</b> EVIDENCE</span>
          </div>
        </section>

        <section className="intro-strip" id="how-it-works">
          <div className="intro-label"><span /> A CAREER COMPANION, NOT A SHORTCUT</div>
          <p>
            Real growth happens one step at a time. GradPath helps you make each
            step <strong>clearer, more focused, and easier to act on.</strong>
          </p>
        </section>

        <section className="features-section" id="features">
          <div className="section-heading">
            <div>
              <span className="eyebrow">FROM UNCERTAINTY TO ACTION</span>
              <h2>A path you can actually follow.</h2>
            </div>
            <p>
              Four connected parts. One goal: helping you make informed decisions
              about your career development.
            </p>
          </div>
          <div className="feature-grid">
            {features.map((feature) => (
              <article className="feature-card" key={feature.number}>
                <div className="feature-card-top">
                  <span className="feature-number">{feature.number}</span>
                  <span className="feature-icon">{feature.icon}</span>
                </div>
                <span className="feature-tag">{feature.tag}</span>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
                <a href="#principles" className="feature-link" aria-label={`Learn about ${feature.title}`}>
                  Learn more <span>↗</span>
                </a>
              </article>
            ))}
          </div>
        </section>

        <section className="principles-section" id="principles">
          <div className="principles-copy">
            <span className="eyebrow">DESIGNED WITH INTENTION</span>
            <h2>Your progress should mean something.</h2>
            <p>
              A skill mentioned on a CV is a starting point, not proof. GradPath
              is designed to distinguish what is mentioned, what is practised,
              and what has verified evidence behind it.
            </p>
            <a href="#get-started" className="button button-light">
              Start with your goals <span>↗</span>
            </a>
          </div>
          <div className="principles-list">
            <div className="principle-item">
              <span className="principle-symbol">01</span>
              <div><strong>Clarity over guesswork</strong><p>Recommendations should explain why they are relevant.</p></div>
            </div>
            <div className="principle-item">
              <span className="principle-symbol">02</span>
              <div><strong>Evidence over assumptions</strong><p>CV mentions and completed projects do not automatically verify skills.</p></div>
            </div>
            <div className="principle-item">
              <span className="principle-symbol">03</span>
              <div><strong>Progress over perfection</strong><p>Build momentum through realistic, actionable next steps.</p></div>
            </div>
          </div>
        </section>

        <section className="closing-section">
          <span className="closing-spark">✳</span>
          <span className="eyebrow">YOUR NEXT CHAPTER STARTS HERE</span>
          <h2>You don't need every answer.<br /><em>Just a clearer next step.</em></h2>
          <a className="button button-dark" href="#features">
            Find your starting point <span>↗</span>
          </a>
        </section>
      </main>

      <footer className="site-footer">
        <Brand />
        <p>Built for thoughtful progress. Powered by evidence.</p>
        <span>GradPath · Career readiness prototype</span>
      </footer>
    </div>
  )
}

export default App












