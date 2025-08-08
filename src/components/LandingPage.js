import React, { useState, useEffect } from 'react';
import './LandingPage.css';
// Slideshow component for landing images
const slideshowImages = [1, 2, 3, 4].map(i => `${process.env.PUBLIC_URL}/landing-${i}.png`);

function Slideshow() {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setIndex(i => (i + 1) % slideshowImages.length);
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  const goPrev = (e) => {
    e.stopPropagation();
    setIndex(i => (i - 1 + slideshowImages.length) % slideshowImages.length);
  };
  const goNext = (e) => {
    e.stopPropagation();
    setIndex(i => (i + 1) % slideshowImages.length);
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={goPrev}
        aria-label="Previous"
        style={{
          position: 'absolute',
          left: 0,
          top: '90%',
          transform: 'translateY(-50%)',
          background: 'rgba(255,255,255,0.7)',
          border: 'none',
          borderRadius: '50%',
          width: 36,
          height: 36,
          fontSize: 22,
          cursor: 'pointer',
          zIndex: 2
        }}
      >&#8592;</button>
      <img
        src={slideshowImages[index]}
        alt={`App Screenshot ${index + 1}`}
        className="screenshot-placeholder"
        style={{ objectFit: 'contain', width: '520px', height: '320px', borderRadius: '16px', border: '2px solid #c7d2fe', background: '#f1f5f9', transition: 'opacity 0.5s' }}
      />
      <button
        onClick={goNext}
        aria-label="Next"
        style={{
          position: 'absolute',
          right: 0,
          top: '90%',
          transform: 'translateY(-50%)',
          background: 'rgba(255,255,255,0.7)',
          border: 'none',
          borderRadius: '50%',
          width: 36,
          height: 36,
          fontSize: 22,
          cursor: 'pointer',
          zIndex: 2
        }}
      >&#8594;</button>
    </div>
  );
}

const features = [
  {
    icon: '📦',
    title: 'Inventory Management',
    desc: 'Track cost per unit and manage ingredient categories easily.'
  },
  {
    icon: '🥣',
    title: 'Recipe Builder',
    desc: 'Mix ingredients, apply overhead, and know your actual cost.'
  },
  {
    icon: '💲',
    title: 'Smart Markup',
    desc: 'Apply markup and see your profit instantly.'
  },
  {
    icon: '📤',
    title: 'Save & Export Recipes',
    desc: 'Download your recipe cost sheets in PDF/CSV.'
  }
];

const plans = [
  // {
  //   name: 'Free',
  //   price: '$0',
  //   period: '/month',
  //   features: ['5 items', '3 recipes', 'No export']
  // },
  // {
  //   name: 'Basic',
  //   price: '$',
  //   period: '/month',
  //   features: ['50 items', '20 recipes', 'PDF export']
  // },
  // {
  //   name: 'Pro',
  //   price: '$',
  //   period: '/month',
  //   features: ['Unlimited items', 'CSV export', 'Profit simulator']
  // }
];

const testimonials = [
//   {
//     text: 'This tool saved me from mindlessly pricing my dishes.',
//     name: 'Ana',
//     role: 'home baker'
//   },
//   {
//     text: 'Finally understand my profit margins!',
//     name: 'Luis',
//     role: 'cloud kitchen'
//   }
];

const LandingPage = ({ onStart }) => (
  <div className="landing-root">
    <div className="hero">
      <div className="hero-content">
        <h1 className="hero-title">Take the Guesswork<br />Out of Your Food Pricing</h1>
        <p className="hero-desc">Instantly calculate recipe costs, markup, and profit margin with ease.</p>
        <button className="hero-btn" onClick={onStart}> Start Free</button>
      </div>
      <div className="hero-image">
        <Slideshow />
      </div>
    </div>

    <div className="features-section">
      <h2 className="features-title">Built for Small Food Businesses</h2>
      <div className="features-grid">
        {features.map(f => (
          <div className="feature-card" key={f.title}>
            <div className="feature-icon">{f.icon}</div>
            <div className="feature-title">{f.title}</div>
            <div className="feature-desc">{f.desc}</div>
          </div>
        ))}
      </div>
    </div>

    <div className="steps-section">
      <h2 className="steps-title">How It Works in 3 Simple Steps</h2>
      <div className="steps-content">
        <div className="steps-list">
          <div className="step"><span className="step-num">1</span> Add your ingredients with cost/unit</div>
          <div className="step"><span className="step-num">2</span> Build your recipe with overhead and waste</div>
          <div className="step"><span className="step-num">3</span> Apply markup and get your selling price</div>
        </div>
        <div className="plans-table">
          {plans.map(plan => (
            <div className="plan-card" key={plan.name}>
              <div className="plan-name">{plan.name}</div>
              <div className="plan-price">{plan.price}<span className="plan-period">{plan.period}</span></div>
              <ul className="plan-features">
                {plan.features.map(f => <li key={f}>{f}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>

    <div className="testimonials-section">
      {/* <h2 className="testimonials-title">Simple Pricing for everyone</h2> */}
      <div className="testimonials-grid">
        {testimonials.map(t => (
          <div className="testimonial-card" key={t.name}>
            <div className="testimonial-text">“{t.text}”</div>
            <div className="testimonial-user">{t.name}<span className="testimonial-role">{t.role}</span></div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default LandingPage;
