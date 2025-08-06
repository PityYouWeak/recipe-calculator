import React from 'react';

const HelpSection = () => (
  <div className="help-section">
    <h3 className="help-title">💡 Cost Calculation Guide</h3>
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

export default HelpSection;
