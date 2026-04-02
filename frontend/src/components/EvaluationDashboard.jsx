import React, { useState, useEffect } from 'react';
import './EvaluationDashboard.css';

function EvaluationDashboard({ onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    fetch(`${API_BASE_URL}/evaluation`)
      .then(res => {
         if (!res.ok) throw new Error('Evaluation data not found. Please ensure the backend is running and the evaluation script was executed.');
         return res.json();
      })
      .then(data => {
         setData(data);
         setLoading(false);
      })
      .catch(err => {
         setError(err.message);
         setLoading(false);
      });
  }, []);

  if (loading) return (
    <div className="evaluation-dashboard">
        <div className="eval-loading">
            <div className="loader"></div>
            <p>Loading evaluation metrics...</p>
        </div>
    </div>
  );
  
  if (error) return (
    <div className="evaluation-dashboard">
        <button className="eval-close-btn" onClick={onClose}>&times;</button>
        <div className="eval-error">⚠️ {error}</div>
    </div>
  );

  const models = ['ML', 'DL', 'BERT'];

  return (
    <div className="evaluation-dashboard">
       <button className="eval-close-btn" onClick={onClose}>&times;</button>
       <div className="eval-header">
           <h2>Model Evaluation & Comparison</h2>
           <p>Systematic performance analysis of classification algorithms on the benchmark emotion dataset.</p>
       </div>
       
       <div className="eval-metrics-grid">
         {models.map(model => (
            <div className="eval-metric-card" key={model}>
               <h3>{data.metrics[model].model}</h3>
               <div className="eval-stat-row"><span>Accuracy</span> <strong>{(data.metrics[model].accuracy * 100).toFixed(1)}%</strong></div>
               <div className="eval-progress"><div className="eval-progress-bar" style={{width: `${data.metrics[model].accuracy * 100}%`}}></div></div>
               
               <div className="eval-stat-row"><span>Precision</span> <strong>{(data.metrics[model].precision * 100).toFixed(1)}%</strong></div>
               <div className="eval-progress"><div className="eval-progress-bar" style={{width: `${data.metrics[model].precision * 100}%`}}></div></div>
               
               <div className="eval-stat-row"><span>Recall</span> <strong>{(data.metrics[model].recall * 100).toFixed(1)}%</strong></div>
               <div className="eval-progress"><div className="eval-progress-bar" style={{width: `${data.metrics[model].recall * 100}%`}}></div></div>
               
               <div className="eval-stat-row"><span>F1-Score</span> <strong>{(data.metrics[model].f1 * 100).toFixed(1)}%</strong></div>
               <div className="eval-progress"><div className="eval-progress-bar" style={{width: `${data.metrics[model].f1 * 100}%`, background: 'var(--eval-accent)'}}></div></div>
            </div>
         ))}
       </div>

       <div className="eval-matrix-section">
           <h3>Confusion Matrix (Winning Model: DistilRoBERTa)</h3>
           <div className="eval-matrix-container">
              <table className="eval-matrix">
                 <thead>
                    <tr>
                       <th>True \ Pred</th>
                       {data.labels.map(l => <th key={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</th>)}
                    </tr>
                 </thead>
                 <tbody>
                    {data.metrics.BERT.confusion_matrix.map((row, i) => (
                       <tr key={data.labels[i]}>
                          <th>{data.labels[i].charAt(0).toUpperCase() + data.labels[i].slice(1)}</th>
                          {row.map((val, j) => {
                             const maxVal = Math.max(...data.metrics.BERT.confusion_matrix.flat());
                             const intensity = Math.max(0.05, val / maxVal);
                             // Adjust text color based on background intensity for readability
                             const isDark = intensity > 0.5;
                             return (
                               <td key={j} style={{ 
                                   backgroundColor: `rgba(59, 130, 246, ${intensity})`,
                                   color: isDark ? '#fff' : 'var(--text-primary)'
                               }}>
                                  {val}
                               </td>
                             )
                          })}
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
       </div>
    </div>
  );
}

export default EvaluationDashboard;
