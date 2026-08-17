const SPOKE_ANGLES = [0, 45, 90, 135, 180];

export function StadiumDiagram() {
  return (
    <div className="diagram-container" aria-hidden>
      <div className="diagram-circles" />
      {SPOKE_ANGLES.map((deg) => (
        <div key={deg} className="diagram-spoke" style={{ transform: `rotate(${deg}deg)` }} />
      ))}
      <span className="runner-figure runner-top-left">🏃</span>
      <span className="runner-figure runner-middle-right">🏃</span>
      <span className="runner-figure runner-bottom-left">🏃</span>
      <span className="runner-figure runner-top-right">🏃</span>
      <span className="runner-figure runner-bottom-right">🏃</span>
      <div className="light-beam" />
      <span className="center-figure">🏃</span>
      <div className="token gold-top">
        <span className="runner-figure-gold">🏃</span>
      </div>
      <div className="token silver">
        <span className="runner-figure">🏃</span>
      </div>
      <div className="token gold-side">
        <span className="runner-figure-gold">🏃</span>
      </div>
      <div className="token bronze">
        <span className="runner-figure">🏃</span>
      </div>
    </div>
  );
}
