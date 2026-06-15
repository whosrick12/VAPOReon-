import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../CSS/HeroVideo.css";

export default function HeroVideo() {
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  const [videoIndex, setVideoIndex] = useState(0);
  const videoRef = useRef(null);
  const navigate = useNavigate();

  const videos = [
    { 
      src: "/videos/sekiro.mp4", 
      title: "Sekiro: Shadows Die Twice", 
      badge: "TRAILER OFICIAL", 
      description: "Domine a arte do combate shinobi em uma jornada brutal por vingança e redenção.",
      jogoId: 68
    },
    { 
      src: "/videos/ghostoftsushima.mp4", 
      title: "Ghost of Tsushima", 
      badge: "EM DESTAQUE", 
      description: "Explore a ilha de Tsushima e enfrente a invasão mongol em uma aventura épica de mundo aberto.",
      jogoId: 67
    }
  ];

  const currentVideo = videos[videoIndex];

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.muted = true;
      videoRef.current.play().catch(e => console.log("Autoplay bloqueado"));
    }
  }, [videoIndex]);

  const toggleMute = (e) => {
    e.stopPropagation();
    setMuted(!muted);
    if (videoRef.current) {
      videoRef.current.muted = !muted;
    }
  };

  const togglePlay = (e) => {
    if (e) e.stopPropagation();
    if (videoRef.current) {
      if (playing) {
        videoRef.current.pause();
        setPlaying(false);
      } else {
        videoRef.current.play();
        setPlaying(true);
      }
    }
  };

  const nextVideo = (e) => {
    e.stopPropagation();
    setVideoIndex((prev) => (prev + 1) % videos.length);
    setPlaying(true);
  };

  const prevVideo = (e) => {
    e.stopPropagation();
    setVideoIndex((prev) => (prev - 1 + videos.length) % videos.length);
    setPlaying(true);
  };

  const handleCardClick = () => {
    togglePlay();
  };

  const handleVerJogos = (e) => {
    e.stopPropagation();
    navigate(`/jogo/${currentVideo.jogoId}`);
  };

  return (
    <div className="hero-video-wrapper">
      <div 
        className="hero-video-card"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <div className="hero-video-container" onClick={handleCardClick}>
          <video
            ref={videoRef}
            className="hero-video"
            autoPlay
            loop
            muted={muted}
            playsInline
            key={currentVideo.src}
          >
            <source src={currentVideo.src} type="video/mp4" />
          </video>
          
          <div className="hero-video-overlay"></div>
          
          {isHovering && (
            <>
              <button className="hero-video-prev" onClick={prevVideo}>❮</button>
              <button className="hero-video-next" onClick={nextVideo}>❯</button>
              
              <div className="hero-video-content">
                <div className="hero-video-badge">{currentVideo.badge}</div>
                <h1 className="hero-video-title">{currentVideo.title}</h1>
                <p className="hero-video-description">{currentVideo.description}</p>
                <div className="hero-video-buttons">
                  <button className="hero-btn-primary" onClick={handleVerJogos}>
                    🎮 Ver Jogo
                  </button>
                  <button className="hero-btn-secondary" onClick={(e) => { e.stopPropagation(); togglePlay(); }}>
                    {playing ? "⏸️ Pausar" : "▶️ Play"}
                  </button>
                  <button className="hero-btn-mute" onClick={toggleMute}>
                    {muted ? "🔇" : "🔊"}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}