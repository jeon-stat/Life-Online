export function StageLights() {
  return (
    <>
      <ambientLight intensity={1.18} color="#fff4ea" />
      <directionalLight position={[4, 5, 5]} intensity={1.12} color="#fff2de" />
      <directionalLight position={[-4, 2, 3]} intensity={0.36} color="#ffe8d3" />
      <pointLight position={[0, 2, 3]} intensity={0.24} color="#ffe0bf" />
    </>
  );
}
