import Image from "next/image";

const BACKDROP_SRC = "/images/olympiad-arena-backdrop.webp";

export function ColiseumBackdrop() {
  return (
    <div className="coliseum-backdrop" aria-hidden>
      <Image
        src={BACKDROP_SRC}
        alt=""
        fill
        priority
        quality={90}
        className="coliseum-photo"
        sizes="100vw"
      />
      <div className="coliseum-vignette" />
    </div>
  );
}
