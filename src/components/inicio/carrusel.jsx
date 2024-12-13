import React, { useState, useEffect } from 'react';
import styles from './Carrusel.module.css';

const Carrusel = ({ images, autoPlayInterval = 5000 }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [images.length, autoPlayInterval]);

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  return (
    <div className={styles.carousel}>
      <div 
        className={styles.carouselInner} 
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {images.map((image, index) => (
          <div key={index} className={styles.carouselItem}>
            <img src={image.src} alt={`Slide ${index + 1}`} />
            <div className={styles.caption}>{image.caption}</div>
          </div>
        ))}
      </div>
      <button className={`${styles.carouselButton} ${styles.prevButton}`} onClick={prevSlide}>
        &#8249;
      </button>
      <button className={`${styles.carouselButton} ${styles.nextButton}`} onClick={nextSlide}>
        &#8250;
      </button>
      <div className={styles.indicators}>
        {images.map((_, index) => (
          <span 
            key={index} 
            className={`${styles.indicator} ${index === currentIndex ? styles.active : ''}`}
            onClick={() => goToSlide(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default Carrusel;

