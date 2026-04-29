import React, { useMemo } from 'react';

const generateStars = (count) => {
  let stars = "";
  for (let i = 0; i < count; i++) {
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    const starColor = i % 10 === 0 ? "#e0f2fe" : "#ffffff";
    stars += `${x}vw ${y}vh ${starColor}${i < count - 1 ? ", " : ""}`;
  }
  return stars;
};

export default function StarFieldBackground() {
  const layers = useMemo(() => [
    { id: 'small',  size: '1px', duration: '120s', shadow: generateStars(500) },
    { id: 'medium', size: '2px', duration: '80s',  shadow: generateStars(250) },
    { id: 'large',  size: '3px', duration: '40s',  shadow: generateStars(80)  },
  ], []); 

  return (
    <div className="fixed inset-0 -z-30 bg-black overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(15,23,42,0.8)_0%,rgba(0,0,0,1)_100%)]" />

      {layers.map((layer) => (
        <React.Fragment key={layer.id}>
          <div 
            className={`stars-layer stars-${layer.id}`} 
            style={{ 
              boxShadow: layer.shadow,
              width: layer.size,
              height: layer.size,
              animationDuration: `${layer.duration}, 0.8s`,
              animationDelay: `0s, -${Math.random() * 5}s` 
            }} 
          />
          <div 
            className={`stars-layer stars-${layer.id}`} 
            style={{ 
              boxShadow: layer.shadow, 
              width: layer.size,
              height: layer.size,
              top: '-100vh',
              animationDuration: `${layer.duration}, 0.8s`,
              animationDelay: `0s, -${Math.random() * 5}s`
            }} 
          />
        </React.Fragment>
      ))}
    </div>
  );
}