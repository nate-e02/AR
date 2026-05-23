"use client";

import { useEffect } from "react";

export default function ARViewer() {
  useEffect(() => {
    import("@google/model-viewer");
  }, []);

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
      }}
    >
      {/* @ts-ignore */}
      <model-viewer
        src="/models/ship.glb"
        camera-controls
        auto-rotate
        ar
        style={{
          width: "100%",
          height: "100%",
        }}
      />
    </div>
  );
}