export function StageLights() {
  return (
    <>
      <ambientLight intensity={1.2} />
      <directionalLight position={[4, 5, 5]} intensity={1.3} />
      <directionalLight position={[-4, 2, 3]} intensity={0.55} color="#d8efff" />
      <pointLight position={[0, 2, 3]} intensity={0.35} color="#fff4df" />
    </>
  );
}
