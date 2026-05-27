export function StageLights() {
  return (
    <>
      <ambientLight intensity={1.08} color="#ffffff" />
      <directionalLight position={[4, 5, 5]} intensity={0.98} color="#ffffff" />
      <directionalLight position={[-4, 2, 3]} intensity={0.34} color="#f7f7f7" />
      <pointLight position={[0, 2, 3]} intensity={0.12} color="#ffffff" />
    </>
  );
}
