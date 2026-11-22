import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileUp, Save, Sparkles, Plus, Trash2, ArrowRight, FilePen } from 'lucide-react'
import { candidateService } from '../../services/candidateService'
import { Button } from '../../components/ui/Button'
import { Input, Textarea } from '../../components/ui/Input'
import { InlineNotice } from '../../components/ui/Toast'
import { LoadingState } from '../../components/ui/LoadingState'
import './candidate.css'

const empty = { name:'', email:'', phone:'', linkedin:'', github:'', portfolio:'', photoUrl:'', headline:'', location:'', summary:'', education:[], experience:[], skills:[] }

export function CandidatePage() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(empty)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    candidateService.getProfile()
      .then(r => setProfile({...empty, ...r.profile}))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  function patch(k, v) {
    setProfile(p => ({...p, [k]: v}))
  }

  async function save() {
    setSaving(true)
    setError('')
    try {
      await candidateService.saveProfile(profile)
      setNotice('Profile saved successfully.')
    } catch(e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleNext() {
    await save()
    navigate('/job-analysis')
  }

  async function upload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError('')
    setNotice('')
    try {
      const r = await candidateService.uploadResume(file)
      setProfile(p => ({...p, ...r.profile}))
      setNotice('CV extracted! Review the fields below and save when you are ready.')
    } catch(err) {
      setError(err.message)
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  function handlePhotoUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Quick validation
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file for your profile photo.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('Profile photo must be under 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      patch('photoUrl', event.target.result);
      setNotice('Profile photo updated. Remember to save.');
    };
    reader.readAsDataURL(file);
  }

  if (loading) return <div className="page"><div className="container"><LoadingState label="Loading your profile..." /></div></div>

  return (
    <div className="page candidate-page">
      <div className="container">
        
        <div className="page-header text-center mb-8">
          <div className="eyebrow mb-4">DEVSIL Professional</div>
          <h1 className="text-display mt-4">Build Your Professional Profile</h1>
          <p className="muted mx-auto max-w-md mt-4">Upload your existing CV to auto-fill, or build your profile from scratch. The generation engine relies strictly on this data.</p>
        </div>

        {error && <div className="candidate-alert mb-4"><InlineNotice tone="error">{error}</InlineNotice></div>}
        {notice && <div className="candidate-alert mb-4"><InlineNotice tone="success"><Sparkles size={16} /> {notice}</InlineNotice></div>}

        <div className="candidate-grid">
          {/* TOP CARDS: Choice */}
          <div className="profile-options grid-2 mb-8">
            <label className={`upload-zone card card-pad text-center ${uploading ? 'disabled' : ''}`} style={{ cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s', position: 'relative' }}>
              <div className="feature-icon bg-indigo mx-auto"><FileUp size={28} /></div>
              <h3 className="text-display">Upload Existing CV</h3>
              <p className="muted mt-4">Automatically extract your professional information.</p>
              <input type="file" accept=".pdf,.docx" hidden onChange={upload} disabled={uploading}/>
              {uploading && <div style={{ marginTop: '16px', color: 'var(--accent)', fontWeight: 600 }}>Extracting Data...</div>}
            </label>
            
            <div className="manual-zone card card-pad text-center" onClick={() => document.getElementById('manual-profile-form').scrollIntoView({ behavior: 'smooth' })} style={{ cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}>
              <div className="feature-icon bg-indigo mx-auto"><FilePen size={28} /></div>
              <h3 className="text-display">Type Manually</h3>
              <p className="muted mt-4">Enter your professional information yourself.</p>
            </div>
          </div>

          <div id="manual-profile-form" className="card card-pad stack-lg">
            <div className="section-header">
              <h2 className="text-display">Professional Information</h2>
              <p className="muted">Verify your extracted details or build from scratch.</p>
            </div>


            
            <section className="profile-section">
              <h3 className="text-display section-heading">Identity & Summary</h3>
              
              <div className="profile-photo-upload-section mb-6" style={{ display: 'flex', alignItems: 'center', gap: '24px', padding: '16px', background: 'var(--surface-soft)', borderRadius: 'var(--radius-md)' }}>
                <div className="photo-preview" style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--border)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {profile.photoUrl ? (
                    <img src={profile.photoUrl} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <FileUp size={32} style={{ color: 'var(--text-muted)' }} />
                  )}
                </div>
                <div>
                  <h4 style={{ margin: '0 0 8px', fontSize: '1rem', fontWeight: 600 }}>Profile Photo (Optional)</h4>
                  <p className="muted text-sm mb-3">Square, under 2MB. Used in Europass and Professional CV templates.</p>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', margin: 0 }}>
                      Choose Photo
                      <input type="file" accept="image/*" hidden onChange={handlePhotoUpload} />
                    </label>
                    {profile.photoUrl && (
                      <Button variant="ghost" size="sm" onClick={() => patch('photoUrl', '')} style={{ color: 'var(--danger)' }}>Remove</Button>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid-2">
                <Input label="Full Name" value={profile.name} onChange={e=>patch('name',e.target.value)}/>
                <Input label="Professional Headline" value={profile.headline} onChange={e=>patch('headline',e.target.value)} placeholder="e.g. Senior Software Engineer"/>
              </div>
              <div className="grid-2">
                <Input label="Email" value={profile.email} onChange={e=>patch('email',e.target.value)} type="email"/>
                <Input label="Phone" value={profile.phone} onChange={e=>patch('phone',e.target.value)}/>
              </div>
              <div className="grid-2">
                <Input label="Location" value={profile.location} onChange={e=>patch('location',e.target.value)} placeholder="City, Country"/>
                <Input label="LinkedIn URL" value={profile.linkedin} onChange={e=>patch('linkedin',e.target.value)} type="url"/>
              </div>
              <div className="grid-2">
                <Input label="GitHub URL" value={profile.github} onChange={e=>patch('github',e.target.value)} type="url"/>
                <Input label="Portfolio URL" value={profile.portfolio} onChange={e=>patch('portfolio',e.target.value)} type="url"/>
              </div>
              <Textarea label="Professional Summary" value={profile.summary} onChange={e=>patch('summary',e.target.value)} placeholder="A concise, factual summary of your experience."/>
            </section>

            <div className="divider" />

            <section className="profile-section">
              <div className="section-header row-between">
                <h3 className="text-display section-heading">Experience</h3>
                <Button size="sm" variant="secondary" icon={<Plus size={16} />} onClick={()=>patch('experience',[...profile.experience,{company:'',title:'',startDate:'',endDate:'',description:''}])}>Add Role</Button>
              </div>
              
              <div className="stack">
                {profile.experience.length === 0 && <p className="muted empty-state">No experience added yet.</p>}
                {profile.experience.map((item, i) => (
                  <div className="repeat-card" key={item.id||i}>
                    <div className="repeat-card-header row-between">
                      <span className="repeat-card-title">Role {i+1}</span>
                      <button type="button" className="icon-btn danger" onClick={()=>patch('experience',profile.experience.filter((_,idx)=>idx!==i))}><Trash2 size={16} /></button>
                    </div>
                    <div className="grid-2">
                      <Input label="Job Title" value={item.title} onChange={e=>{const a=[...profile.experience];a[i]={...a[i],title:e.target.value};patch('experience',a)}}/>
                      <Input label="Company" value={item.company} onChange={e=>{const a=[...profile.experience];a[i]={...a[i],company:e.target.value};patch('experience',a)}}/>
                    </div>
                    <div className="grid-2">
                      <Input label="Start Date" value={item.startDate||''} onChange={e=>{const a=[...profile.experience];a[i]={...a[i],startDate:e.target.value};patch('experience',a)}} placeholder="e.g. Jan 2020"/>
                      <Input label="End Date" value={item.endDate||''} onChange={e=>{const a=[...profile.experience];a[i]={...a[i],endDate:e.target.value};patch('experience',a)}} placeholder="e.g. Present"/>
                    </div>
                    <Textarea label="Description & Achievements" value={item.description||''} onChange={e=>{const a=[...profile.experience];a[i]={...a[i],description:e.target.value};patch('experience',a)}}/>
                  </div>
                ))}
              </div>
            </section>

            <div className="divider" />

            <section className="profile-section">
              <div className="section-header row-between">
                <h3 className="text-display section-heading">Education</h3>
                <Button size="sm" variant="secondary" icon={<Plus size={16} />} onClick={()=>patch('education',[...profile.education,{institution:'',degree:'',field:'',startDate:'',endDate:'',details:''}])}>Add Education</Button>
              </div>
              
              <div className="stack">
                {profile.education.length === 0 && <p className="muted empty-state">No education added yet.</p>}
                {profile.education.map((item, i) => (
                  <div className="repeat-card" key={item.id||i}>
                    <div className="repeat-card-header row-between">
                      <span className="repeat-card-title">Education {i+1}</span>
                      <button type="button" className="icon-btn danger" onClick={()=>patch('education',profile.education.filter((_,idx)=>idx!==i))}><Trash2 size={16} /></button>
                    </div>
                    <div className="grid-2">
                      <Input label="Degree / Certificate" value={item.degree} onChange={e=>{const a=[...profile.education];a[i]={...a[i],degree:e.target.value};patch('education',a)}}/>
                      <Input label="Institution" value={item.institution} onChange={e=>{const a=[...profile.education];a[i]={...a[i],institution:e.target.value};patch('education',a)}}/>
                    </div>
                    <div className="grid-2">
                      <Input label="Field of Study" value={item.field||''} onChange={e=>{const a=[...profile.education];a[i]={...a[i],field:e.target.value};patch('education',a)}}/>
                      <Input label="Dates" value={item.endDate||''} onChange={e=>{const a=[...profile.education];a[i]={...a[i],endDate:e.target.value};patch('education',a)}} placeholder="e.g. 2018 - 2022"/>
                    </div>
                  </div>
                ))}
              </div>
            </section>
            
            <div className="divider" />

            <section className="profile-section">
              <h3 className="text-display section-heading" style={{ color: 'var(--accent)' }}>Skills</h3>
              <p className="muted mb-4">Enter one skill per line. We'll use these to match against job requirements.</p>
              <textarea 
                className="skill-editor field" 
                style={{ width: '100%', minHeight: '140px', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-strong)', outline: 'none', fontFamily: 'inherit' }}
                value={profile.skills.join('\n')} 
                onChange={e=>patch('skills',e.target.value.split('\n').map(s=>s.trim()).filter(Boolean))} 
                placeholder="JavaScript&#10;React&#10;Node.js"
              />
            </section>
            
            <div className="divider" />
            
            <div className="action-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px' }}>
              <Button onClick={() => navigate('/')} variant="ghost">← Back</Button>
              <div style={{ display: 'flex', gap: '16px' }}>
                <Button icon={<Save size={18}/>} onClick={save} loading={saving} variant="secondary">
                  Save Profile
                </Button>
                <Button icon={<ArrowRight size={18}/>} onClick={handleNext} disabled={saving} variant="primary">
                  Analyze Job →
                </Button>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  )
}
