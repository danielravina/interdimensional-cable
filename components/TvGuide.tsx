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
const LOOKBACK_SECONDS = 120;
const LOOKAHEAD_SECONDS = 600;

function secondsSinceMidnight(date: Date): number {
  return (
    date.getUTCHours() * 3600 +
    date.getUTCMinutes() * 60 +
    date.getUTCSeconds() +
    date.getUTCMilliseconds() / 1000
  );
}

const TZ_OFFSET_SECONDS = new Date().getTimezoneOffset() * 60;

function formatTimeLabel(utcTotalSeconds: number): string {
  let local = utcTotalSeconds - TZ_OFFSET_SECONDS;
  local = ((local % 86400) + 86400) % 86400;
  const h = Math.floor(local / 3600);
  const m = Math.floor((local % 3600) / 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function buildUnifiedTimeline(
  timeline: TimelineEntry[],
  totalDuration: number,
  windowStart: number,
  windowEnd: number,
): DisplayEntry[] {
  if (totalDuration === 0 || timeline.length === 0) return [];

  const entries: DisplayEntry[] = [];
  let cycles = 0;

  outer: while (true) {
    const cycleStart = cycles * totalDuration;
    if (cycleStart >= windowEnd) break;

    // Skip entire cycles that end before the window
    if (cycleStart + totalDuration <= windowStart) {
      cycles++;
      continue;
    }

    for (const entry of timeline) {
      const duration = entry.video.duration ?? 60;
      const absStart = cycleStart + entry.startTime;

      if (absStart >= windowEnd) break outer;

      const absEnd = absStart + duration;
      if (absEnd <= windowStart) continue;

      const visibleStart = Math.max(absStart, windowStart);
      const visibleEnd = Math.min(absEnd, windowEnd);

      entries.push({
        title: entry.video.title,
        thumbnail: entry.video.thumbnail,
        startPx: (visibleStart - windowStart) * PX_PER_SECOND,
        widthPx: Math.max((visibleEnd - visibleStart) * PX_PER_SECOND, 4),
      });
    }
    cycles++;
  }

  entries.sort((a, b) => a.startPx - b.startPx);
  return entries;
}

export default function TvGuide({
  channels,
  currentChannel,
  onSelect,
  onClose,
}: TvGuideProps) {
  const [focusChannel, setFocusChannel] = useState(currentChannel);
  const channelsRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const timeHeaderRef = useRef<HTMLDivElement>(null);
  const syncingScroll = useRef(false);
  const syncingTimeScroll = useRef(false);

  const [elapsed, setElapsed] = useState(() =>
    secondsSinceMidnight(new Date()),
  );

  useEffect(() => {
    const id = setInterval(() => {
      setElapsed(secondsSinceMidnight(new Date()));
    }, 500);
    return () => clearInterval(id);
  }, []);

  const windowStart = elapsed - LOOKBACK_SECONDS;
  const windowEnd = elapsed + LOOKAHEAD_SECONDS;
  const windowSeconds = LOOKBACK_SECONDS + LOOKAHEAD_SECONDS;
  const gridWidth = windowSeconds * PX_PER_SECOND;
  const nowPx = LOOKBACK_SECONDS * PX_PER_SECOND;

  const channelDisplays = useMemo(
    () =>
      channels.map((ch) => ({
        ...ch,
        displayTimeline: buildUnifiedTimeline(
          ch.timeline,
          ch.totalDuration,
          windowStart,
          windowEnd,
        ),
      })),
    [channels, windowStart, windowEnd],
  );

  const timeLabels = useMemo(() => {
    const labels: { label: string; left: number }[] = [];
    const firstLabel =
      Math.ceil(windowStart / TIME_LABEL_INTERVAL) * TIME_LABEL_INTERVAL;
    for (let t = firstLabel; t <= windowEnd; t += TIME_LABEL_INTERVAL) {
      labels.push({
        label: formatTimeLabel(t),
        left: (t - windowStart) * PX_PER_SECOND,
      });
    }
    return labels;
  }, [windowStart, windowEnd]);

  const handleChannelScroll = useCallback(() => {
    if (syncingScroll.current) return;
    syncingScroll.current = true;
    if (channelsRef.current && gridRef.current) {
      gridRef.current.scrollTop = channelsRef.current.scrollTop;
    }
    requestAnimationFrame(() => {
      syncingScroll.current = false;
    });
  }, []);

  const handleGridScroll = useCallback(() => {
    if (!syncingScroll.current && channelsRef.current && gridRef.current) {
      syncingScroll.current = true;
      channelsRef.current.scrollTop = gridRef.current.scrollTop;
      requestAnimationFrame(() => {
        syncingScroll.current = false;
      });
    }

    if (
      !syncingTimeScroll.current &&
      timeHeaderRef.current &&
      gridRef.current
    ) {
      syncingTimeScroll.current = true;
      timeHeaderRef.current.scrollLeft = gridRef.current.scrollLeft;
      requestAnimationFrame(() => {
        syncingTimeScroll.current = false;
      });
    }
  }, []);

  const handleTimeHeaderScroll = useCallback(() => {
    if (syncingTimeScroll.current) return;
    syncingTimeScroll.current = true;
    if (gridRef.current && timeHeaderRef.current) {
      gridRef.current.scrollLeft = timeHeaderRef.current.scrollLeft;
    }
    requestAnimationFrame(() => {
      syncingTimeScroll.current = false;
    });
  }, []);

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
        gridRef.current?.scrollBy({ left: -180, behavior: "smooth" });
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        gridRef.current?.scrollBy({ left: 180, behavior: "smooth" });
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
    if (!gridRef.current) return;
    const targetTop = focusChannel * ROW_HEIGHT;
    const grid = gridRef.current;
    const viewTop = grid.scrollTop;
    const viewBottom = viewTop + grid.clientHeight;

    if (targetTop < viewTop || targetTop + ROW_HEIGHT > viewBottom) {
      grid.scrollTo({
        top: Math.max(0, targetTop - ROW_HEIGHT),
        behavior: "smooth",
      });
    }
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
      {/* Time header */}
      <div className="flex shrink-0" style={{ height: TIME_HEADER_HEIGHT }}>
        <div
          className="shrink-0 border-b border-r border-green-700/40 bg-green-900/60 flex items-center justify-center"
          style={{ width: CHANNEL_COL_WIDTH }}
        >
          <span className="text-green-300/80 font-mono text-[10px] tracking-widest">
            CH
          </span>
        </div>

        <div
          ref={timeHeaderRef}
          className="flex-1 overflow-hidden border-b border-green-700/40 bg-green-900/50"
          onScroll={handleTimeHeaderScroll}
        >
          <div style={{ width: gridWidth, height: "100%", position: "relative" }}>
            {timeLabels.map((tl, i) => (
              <div
                key={i}
                className="absolute top-1/2 -translate-y-1/2 font-mono text-[9px] tracking-wider text-green-400/60 whitespace-nowrap select-none"
                style={{ left: tl.left }}
              >
                {tl.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Channel column */}
        <div
          ref={channelsRef}
          className="shrink-0 border-r border-green-700/40 bg-green-900/40 overflow-y-auto scrollbar-none select-none"
          style={{ width: CHANNEL_COL_WIDTH }}
          onScroll={handleChannelScroll}
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

        {/* Shared grid */}
        <div
          ref={gridRef}
          className="flex-1 overflow-auto scrollbar-none"
          onScroll={handleGridScroll}
        >
          <div
            style={{
              width: gridWidth,
              height: channelDisplays.length * ROW_HEIGHT,
              position: "relative",
            }}
          >
            {channelDisplays.map((ch, chIdx) => {
              const idx = ch.num - 1;
              const isActive = idx === currentChannel;
              const isFocused = idx === focusChannel;

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
                  style={{
                    position: "absolute",
                    top: chIdx * ROW_HEIGHT,
                    left: 0,
                    right: 0,
                    height: ROW_HEIGHT,
                  }}
                  onClick={() => onSelect(idx)}
                >
                  {ch.displayTimeline.map((entry, i) => {
                    const isNow =
                      entry.startPx <= nowPx &&
                      nowPx < entry.startPx + entry.widthPx;

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
                </div>
              );
            })}

            {/* Single NOW line across all channels */}
            <div
              className="absolute top-0 bottom-0 w-px pointer-events-none"
              style={{
                left: nowPx,
                zIndex: 10,
                background:
                  "linear-gradient(to bottom, rgba(74,222,128,1), rgba(74,222,128,0.4))",
                boxShadow:
                  "0 0 10px rgba(74,222,128,0.7), 0 0 3px rgba(74,222,128,0.4)",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
