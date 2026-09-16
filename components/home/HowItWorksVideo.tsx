import { HOW_IT_WORKS_VIDEO } from "@/lib/how-it-works-video";

export function HowItWorksVideo() {
  if (!HOW_IT_WORKS_VIDEO) return null;

  if (HOW_IT_WORKS_VIDEO.kind === "video") {
    return (
      <div className="how-it-works-video">
        <video controls playsInline preload="metadata" src={HOW_IT_WORKS_VIDEO.src}>
          <track kind="captions" />
        </video>
      </div>
    );
  }

  return (
    <div className="how-it-works-video">
      <iframe
        src={HOW_IT_WORKS_VIDEO.src}
        title={HOW_IT_WORKS_VIDEO.title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
