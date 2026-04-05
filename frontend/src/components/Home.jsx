import React, { useState } from 'react';
import './Home.css';

const slides = [
  { title: 'Carousel Slide 1', subtitle: 'Your image will appear here', color: '#d0e7ff' },
  { title: 'Carousel Slide 2', subtitle: 'Replace this with your image', color: '#ffe0d4' },
  { title: 'Carousel Slide 3', subtitle: 'Add images later', color: '#e8ffd0' },
];

const Home = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="home-page">
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
