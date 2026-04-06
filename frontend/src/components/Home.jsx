import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './Home.css';

const slides = [
  { title: 'Carousel Slide 1', subtitle: 'Your image will appear here', color: '#d0e7ff' },
  { title: 'Carousel Slide 2', subtitle: 'Replace this with your image', color: '#ffe0d4' },
  { title: 'Carousel Slide 3', subtitle: 'Add images later', color: '#e8ffd0' },
];

const Home = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (searchParams.get('signupSuccess') === 'true') {
      setShowPopup(true);
      const timer = setTimeout(() => {
        setShowPopup(false);
        searchParams.delete('signupSuccess');
        setSearchParams(searchParams, { replace: true });
        navigate('/signin', { state: { from: '/dashboard' } });
      }, 5000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [searchParams, setSearchParams, navigate]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const goToSignin = () => {
    navigate('/signin', { state: { from: '/dashboard' } });
  };

  return (
    <div className="home-page">
      {showPopup && (
        <div className="home-popup-overlay">
          <div className="home-popup">
            <h2>Signup successful!</h2>
            <p>Please sign in to continue to your dashboard.</p>
            <button type="button" onClick={goToSignin}>
              Sign In Now
            </button>
          </div>
        </div>
      )}
      <section className="home-hero">
        <div>
          <h1>Welcome to Clothes Selling</h1>
          <p>Find the newest styles, sell what you no longer need, and discover the perfect fit for your wardrobe.</p>
        </div>
      </section>

      <section className="home-carousel">
        <h2>Featured Items</h2>
        <div className="carousel-window">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`carousel-slide ${index === currentIndex ? 'active' : ''}`}
              style={{ backgroundColor: slide.color }}
            >
              <div className="carousel-content">
                <h3>{slide.title}</h3>
                <p>{slide.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="carousel-actions">
          <button onClick={handlePrev} type="button">Previous</button>
          <button onClick={handleNext} type="button">Next</button>
        </div>
      </section>
    </div>
  );
};

export default Home;
