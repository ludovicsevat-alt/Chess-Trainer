import { useEffect } from "react";
import { createEngine } from "@/engine/engine.js";

export default function UseEngineDemo() {
  useEffect(() => {
    const engine = createEngine();

    const off = engine.onLine((line) => {
      console.log("SF >", line);
    });

    engine.post("uci");
    engine.post("isready");

    // petit test : profondeur 12 depuis la position initiale
    setTimeout(() => {
      engine.go({ depth: 12 });
    }, 800);

    return () => {
      off();
      engine.destroy();
    };
  }, []);

  return null;
}
