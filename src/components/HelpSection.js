import React from 'react';


const HelpSection = () => {
  const [visible, setVisible] = React.useState(true);
  if (!visible) {
    return (
      <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <button
          className="btn btn-primary"
          style={{ fontSize: '0.875rem', padding: '0.5rem 1.5rem' }}
          onClick={() => setVisible(true)}
        >
          Show Cost Guide
        </button>
      </div>
    );
  }
  return (
    <div className="help-section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 className="help-title">💡 Cost Calculation Guide</h3>
        <button
          className="btn btn-danger"
          style={{ fontSize: '0.875rem', padding: '0.25rem 0.75rem' }}
          onClick={() => setVisible(false)}
        >
          Hide
        </button>
      </div>
      <div className="help-grid">
        <div className="help-card">
          <h4>Overhead Costs</h4>
          <p>Fixed business expenses like rent, utilities, insurance, equipment depreciation. Typically 10-20% for small businesses.</p>
        </div>
        <div className="help-card">
          <h4>Waste Factor</h4>
          <p>Account for spillage, trimming, spoilage, or measurement errors during production. Usually 3-10% depending on process.</p>
        </div>
        <div className="help-card">
          <h4>Markup %</h4>
          <p>Your desired profit margin. Food businesses typically use 50-200% markup depending on market and positioning.</p>
        </div>
      </div>
    </div>
  );
};

export default HelpSection;
