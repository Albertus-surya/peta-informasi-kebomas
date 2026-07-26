"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

type SnapPoint = "collapsed" | "half" | "expanded";

const HEIGHTS: Record<SnapPoint, string> = {
  collapsed: "h-[88px]",
  half: "h-[45vh]",
  expanded: "h-[85vh]",
};

interface MobileBottomSheetProps {
  children: React.ReactNode;
}

export default function MobileBottomSheet({
  children,
}: MobileBottomSheetProps) {
  const [snap, setSnap] = useState<SnapPoint>("half");
  const startY = useRef<number | null>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    startY.current = e.clientY;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (startY.current === null) return;
    const delta = e.clientY - startY.current;
    startY.current = null;

    if (Math.abs(delta) < 20) return; // treat as tap, not drag

    if (delta > 0) {
      // dragged down
      setSnap((prev) =>
        prev === "expanded" ? "half" : prev === "half" ? "collapsed" : "collapsed"
      );
    } else {
      // dragged up
      setSnap((prev) =>
        prev === "collapsed" ? "half" : prev === "half" ? "expanded" : "expanded"
      );
    }
  };

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-[1000] flex flex-col rounded-t-2xl border-t border-ink-300 bg-white shadow-popup transition-[height] duration-300 ease-out sm:hidden",
        HEIGHTS[snap]
      )}
    >
      <button
        type="button"
        aria-label="Geser panel kategori"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onClick={() =>
          setSnap((prev) => (prev === "collapsed" ? "half" : "collapsed"))
        }
        className="flex shrink-0 cursor-grab touch-none items-center justify-center py-2 active:cursor-grabbing"
      >
        <span className="h-1.5 w-10 rounded-full bg-ink-300" />
      </button>
      <div className="min-h-0 flex-1 overflow-y-auto kd-scroll">
        {children}
      </div>
    </div>
  );
}
