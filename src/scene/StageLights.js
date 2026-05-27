export function StageLights() {
  return (
    <>
      <ambientLight intensity={1.16} color="#fff5ef" />
      <directionalLight position={[4, 5, 5]} intensity={1.08} color="#fff3e8" />
      <directionalLight position={[-4, 2, 3]} intensity={0.3} color="#ffe7da" />
      <pointLight position={[0, 2, 3]} intensity={0.18} color="#ffe0c8" />
    </>
  );
}
