import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    // React Three Fiber drives the scene by mutating refs, uniforms and
    // geometry attributes inside the imperative useFrame render loop — the
    // intended R3F pattern. The new React-Compiler immutability/purity rules
    // treat that as a violation, so we relax them for the 3D layer only.
    files: ["src/components/three/**/*.{ts,tsx}"],
    rules: {
      "react-hooks/immutability": "off",
      "react-hooks/purity": "off",
      "react-hooks/refs": "off",
      "react-hooks/use-memo": "off",
    },
  },
  {
    // Decode + device profile legitimately set state from an effect in
    // response to rAF / matchMedia changes.
    files: ["src/components/ui/Decode.tsx", "src/components/ui/CountUp.tsx", "src/lib/device.ts"],
    rules: {
      "react-hooks/set-state-in-effect": "off",
    },
  },
]);

export default eslintConfig;
