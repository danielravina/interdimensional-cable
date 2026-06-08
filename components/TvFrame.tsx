import { withBase } from "../lib/basePath";

export default function TvFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-full max-w-[900px] flex items-center justify-center">
      <div
        className="relative w-full"
        style={{
          aspectRatio: "1379/985",
        }}
      >
        <div
          className="absolute overflow-hidden"
          style={{ top: "5.7%", right: "4.7%", bottom: "4.5%", left: "3.4%", borderRadius: "12px" }}
        >
          {children}
        </div>

        <img
          src={withBase("/tv-frame.png")}
          alt=""
          className="absolute inset-0 w-full h-full pointer-events-none select-none"
          style={{ objectFit: "contain", zIndex: 50, borderRadius: "12px", border: "2px solid #333" }}
        />
      </div>
    </div>
  );
}
