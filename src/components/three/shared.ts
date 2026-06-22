import type * as THREE from "three";

// Shared handle to the sun disc mesh so the post-processing GodRays effect
// can use it as its light source without prop-drilling across components.
export const sunMeshRef: { current: THREE.Mesh | null } = { current: null };
