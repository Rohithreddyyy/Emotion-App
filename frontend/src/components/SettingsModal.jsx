import React, { useState } from 'react';
import './EvaluationDashboard.css'; // Reuse existing modal styles

function SettingsModal({ settings, onSave, onClose }) {
  const [name, setName] = useState(settings.name || '');
  const [supportStyle, setSupportStyle] = useState(settings.supportStyle || 'Default');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ name, supportStyle });
    onClose();
  };

  return (
    <div className="evaluation-dashboard" style={{ zIndex: 200, justifyContent: 'center', alignItems: 'center' }}>
       <div className="eval-metric-card" style={{ maxWidth: '500px', width: '100%', margin: '0 auto', position: 'relative' }}>
           <button className="eval-close-btn" onClick={onClose} style={{ top: '15px', right: '15px' }}>&times;</button>
           
           <h2 style={{ marginTop: 0, marginBottom: '24px', fontSize: '24px', color: 'var(--text-primary)' }}>
               Personalization Settings
           </h2>
           
           <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
               <div>
                   <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Your Name</label>
                   <input 
                       type="text" 
                       value={name}
                       onChange={e => setName(e.target.value)}
                       placeholder="How should the AI address you?"
                       style={{
                           width: '100%',
                           padding: '12px',
                           borderRadius: '8px',
                           border: '1px solid var(--border-color)',
                           background: 'var(--bg-primary)',
                           color: 'var(--text-primary)',
                           fontSize: '16px'
                       }}
                   />
               </div>
               
               <div>
                   <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>AI Support Style</label>
                   <select 
                       value={supportStyle}
                       onChange={e => setSupportStyle(e.target.value)}
                       style={{
                           width: '100%',
                           padding: '12px',
                           borderRadius: '8px',
                           border: '1px solid var(--border-color)',
                           background: 'var(--bg-primary)',
                           color: 'var(--text-primary)',
                           fontSize: '16px',
                           appearance: 'none',
                           outline: 'none'
                       }}
                   >
                       <option value="Default">Default (Empathetic)</option>
                       <option value="Extra Empathetic">Extra Empathetic (Deeply Caring)</option>
                       <option value="Professional">Professional (Formal & Courteous)</option>
                       <option value="Direct">Direct (Concise & Clear)</option>
                   </select>
                   <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                       This modifies the baseline prompts sent to the LLM.
                   </p>
               </div>
               
               <button 
                   type="submit"
                   className="send-btn"
                   style={{ width: '100%', padding: '12px', borderRadius: '8px', marginTop: '10px' }}
               >
                   Save Settings
               </button>
           </form>
       </div>
    </div>
  );
}

export default SettingsModal;
