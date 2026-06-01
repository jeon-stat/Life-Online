export function StageLights() {
  return (
    <>
      <ambientLight intensity={0.95} color="#fff7ea" />
      <hemisphereLight skyColor="#fff7e4" groundColor="#f1d2c2" intensity={0.95} />
      <directionalLight position={[4, 5, 5]} intensity={0.6} color="#fff5e8" />
      <directionalLight position={[-4, 2, 3]} intensity={0.22} color="#ffe7dc" />
      <pointLight position={[0, 2, 3]} intensity={0.06} color="#fff6f0" />
    </>
  );
}
