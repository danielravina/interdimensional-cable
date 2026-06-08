"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import type { TimelineEntry } from "@/lib/schedule";

export interface GuideChannel {
  num: number;
  subreddit: string;
  timeline: TimelineEntry[];
  totalDuration: number;
}

interface DisplayEntry {
  title: string;
  thumbnail: string | null;
  startPx: number;
  widthPx: number;
}

interface TvGuideProps {
  channels: GuideChannel[];
  currentChannel: number;
  onSelect: (channel: number) => void;
  onClose: () => void;
}

const PX_PER_SECOND = 2.5;
const CHANNEL_COL_WIDTH = 72;
const ROW_HEIGHT = 64;
const TIME_HEADER_HEIGHT = 28;
const TIME_LABEL_INTERVAL = 30;

function secondsSinceMidnight(date: Date): number {
  return (
    date.getUTCHours() * 3600 +
    date.getUTCMinutes() * 60 +
    date.getUTCSeconds() +
    date.getUTCMilliseconds() / 1000
  );
}

function formatTimeLabel(totalSeconds: number, now: Date): string {
  const absSec = secondsSinceMidnight(now) + totalSeconds;
  const h = Math.floor((absSec % 86400) / 3600);
  const m = Math.floor((absSec % 3600) / 60);
  const s = Math.floor(absSec % 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function buildStaticTimeline(timeline: TimelineEntry[]): DisplayEntry[] {
  return timeline
    .map((entry) => {
      const duration = entry.video.duration ?? 60;
      return {
        title: entry.video.title,
        thumbnail: entry.video.thumbnail,
        startPx: entry.startTime * PX_PER_SECOND,
        widthPx: duration * PX_PER_SECOND,
      };
    })
    .sort((a, b) => a.startPx - b.startPx);
}

export default function TvGuide({
  channels,
  currentChannel,
  onSelect,
  onClose,
}: TvGuideProps) {
  const [focusChannel, setFocusChannel] = useState(currentChannel);
  const channelsRef = useRef<HTMLDivElement>(null);
  const rowsRef = useRef<(HTMLDivElement | null)[]>([]);
  const syncingScroll = useRef(false);

  const [snapshotNow] = useState(() => new Date());
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setElapsed(
        ((secondsSinceMidnight(new Date()) - secondsSinceMidnight(snapshotNow) + 86400) % 86400),
      );
    }, 500);
    return () => clearInterval(id);
  }, [snapshotNow]);

  const channelDisplays = useMemo(
    () =>
      channels.map((ch) => {
        const timeline =
          ch.timeline.length > 0 ? buildStaticTimeline(ch.timeline) : [];
        const nowOffset =
          ch.totalDuration > 0
            ? secondsSinceMidnight(snapshotNow) % ch.totalDuration
            : 0;
        return {
          ...ch,
          displayTimeline: timeline,
          nowOffsetSec: nowOffset,
        };
      }),
    [channels, snapshotNow],
  );

  const nowPx = channelDisplays.map((ch) => {
    if (ch.totalDuration === 0) return 0;
    return (
      ((((ch.nowOffsetSec + elapsed) % ch.totalDuration) + ch.totalDuration) %
        ch.totalDuration) *
      PX_PER_SECOND
    );
  });

  // Auto-scroll current channel's row to its NOW line
  useEffect(() => {
    const row = rowsRef.current[currentChannel];
    if (row) {
      const vw = row.clientWidth;
      const target = Math.max(0, nowPx[currentChannel] - vw * 0.15);
      row.scrollLeft = target;
    }
  }, [currentChannel, nowPx]);

  // Sync vertical scroll
  const syncScrollY = useCallback(
    (source: "channels" | "grid") => {
      if (syncingScroll.current) return;
      syncingScroll.current = true;

      if (source === "channels" && channelsRef.current && rowsRef.current[focusChannel]) {
        rowsRef.current[focusChannel]!.scrollIntoView({ block: "nearest" });
      } else if (source === "grid" && rowsRef.current.length > 0) {
        const topRow = rowsRef.current.find((r) => {
          if (!r || !channelsRef.current) return false;
          const parentRect = channelsRef.current.getBoundingClientRect();
          const rowRect = r.getBoundingClientRect();
          return rowRect.top >= parentRect.top;
        });
        if (topRow) {
          const idx = rowsRef.current.indexOf(topRow);
          if (idx >= 0 && channelsRef.current) {
            const chEl = channelsRef.current.querySelector(
              `[data-focus-row="${idx}"]`,
            ) as HTMLElement | null;
            chEl?.scrollIntoView({ block: "nearest" });
          }
        }
      }

      requestAnimationFrame(() => {
        syncingScroll.current = false;
      });
    },
    [focusChannel],
  );

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setFocusChannel(
          (prev) => (prev - 1 + channels.length) % channels.length,
        );
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setFocusChannel((prev) => (prev + 1) % channels.length);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        rowsRef.current[focusChannel]?.scrollBy({
          left: -180,
          behavior: "smooth",
        });
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        rowsRef.current[focusChannel]?.scrollBy({
          left: 180,
          behavior: "smooth",
        });
      } else if (e.key === "Enter") {
        e.preventDefault();
        onSelect(focusChannel);
      } else if (e.key === "g" || e.key === "G" || e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    },
    [channels.length, focusChannel, onSelect, onClose],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  useEffect(() => {
    const el = channelsRef.current?.querySelector<HTMLElement>(
      `[data-focus-row="${focusChannel}"]`,
    );
    el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [focusChannel]);

  return (
    <div
      className="absolute z-40 flex flex-col animate-guide-up"
      style={{
        top: "8%",
        right: "8%",
        bottom: "7%",
        left: "7%",
        backgroundColor: "#0e1a11",
        borderRadius: "8px",
        overflow: "hidden",
      }}
    >
      <div className="flex-1 flex overflow-hidden">
        {/* Channel column */}
        <div
          className="shrink-0 border-r border-green-700/40 bg-green-900/40 overflow-hidden flex flex-col select-none"
          style={{ width: CHANNEL_COL_WIDTH }}
        >
          <div
            className="shrink-0 border-b border-green-700/40 bg-green-900/60 flex items-center justify-center"
            style={{ height: TIME_HEADER_HEIGHT }}
          >
            <span className="text-green-300/80 font-mono text-[10px] tracking-widest">
              CH
            </span>
          </div>

          <div
            className="flex-1 overflow-y-auto scrollbar-none"
            ref={channelsRef}
            onScroll={() => syncScrollY("channels")}
          >
            {channelDisplays.map((ch) => {
              const idx = ch.num - 1;
              const isActive = idx === currentChannel;
              const isFocused = idx === focusChannel;
              return (
                <div
                  key={ch.num}
                  data-focus-row={idx}
                  onClick={() => onSelect(idx)}
                  className={`flex items-center justify-center border-b border-green-700/30 cursor-pointer transition-colors ${
                    isActive
                      ? "bg-green-500/15 text-green-200"
                      : isFocused
                        ? "bg-green-800/30 text-green-300"
                        : "text-green-400/60 hover:bg-green-800/20 hover:text-green-300"
                  }`}
                  style={{ height: ROW_HEIGHT }}
                >
                  <span className="font-mono text-sm tracking-wider tabular-nums font-bold">
                    {String(ch.num).padStart(2, "0")}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Channel rows column */}
        <div
          className="flex-1 overflow-y-auto scrollbar-none"
          onScroll={() => syncScrollY("grid")}
        >
          {channelDisplays.map((ch, chIdx) => {
            const idx = ch.num - 1;
            const isActive = idx === currentChannel;
            const isFocused = idx === focusChannel;
            const chNowPx = nowPx[chIdx];
            const chWidth = (ch.totalDuration || 1) * PX_PER_SECOND;

            const timeLabels: { label: string; left: number }[] = [];
            for (let t = 0; t <= (ch.totalDuration || 0); t += TIME_LABEL_INTERVAL) {
              timeLabels.push({
                label: formatTimeLabel(t, snapshotNow),
                left: t * PX_PER_SECOND,
              });
            }

            return (
              <div
                key={ch.num}
                className={`border-b border-green-700/30 cursor-pointer transition-colors ${
                  isActive
                    ? "bg-green-500/8"
                    : isFocused
                      ? "bg-green-800/15"
                      : "hover:bg-green-800/10"
                }`}
                style={{ height: ROW_HEIGHT }}
                onClick={() => onSelect(idx)}
              >
                <div
                  ref={(el) => { rowsRef.current[chIdx] = el; }}
                  className="h-full overflow-x-auto scrollbar-none relative"
                >
                  {/* Time labels */}
                  {timeLabels.map((tl, i) => (
                    <div
                      key={i}
                      className="absolute font-mono text-[9px] tracking-wider text-green-400/60 whitespace-nowrap select-none"
                      style={{ left: tl.left, top: 2, zIndex: 5 }}
                    >
                      {tl.label}
                    </div>
                  ))}

                  {/* Show blocks */}
                  {ch.displayTimeline.map((entry, i) => {
                    const isNow =
                      entry.startPx <= chNowPx &&
                      chNowPx < entry.startPx + entry.widthPx;

                    return (
                      <div
                        key={`${ch.num}-${i}`}
                        className={`absolute top-5 bottom-1.5 rounded-sm overflow-hidden border flex items-center gap-1.5 px-1.5 ${
                          isNow
                            ? "border-green-300/80 bg-green-400/20"
                            : "border-green-600/40 bg-green-800/20"
                        }`}
                        style={{
                          left: entry.startPx,
                          width: Math.max(entry.widthPx, 4),
                        }}
                        title={entry.title}
                      >
                        {entry.thumbnail && (
                          <img
                            src={entry.thumbnail}
                            alt=""
                            className="h-9 w-16 rounded-sm object-cover shrink-0 opacity-60"
                            loading="lazy"
                          />
                        )}
                        <span className="text-[10px] font-mono leading-tight truncate text-green-100 select-none">
                          {entry.title}
                        </span>
                      </div>
                    );
                  })}

                  {/* NOW line */}
                  <div
                    className="absolute top-0 bottom-0 w-px pointer-events-none"
                    style={{
                      left: chNowPx,
                      zIndex: 10,
                      background:
                        "linear-gradient(to bottom, rgba(74,222,128,1), rgba(74,222,128,0.4))",
                      boxShadow:
                        "0 0 10px rgba(74,222,128,0.7), 0 0 3px rgba(74,222,128,0.4)",
                    }}
                  />

                  {/* Spacer to ensure full width */}
                  <div style={{ width: chWidth, height: 1 }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
