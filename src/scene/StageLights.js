export function StageLights() {
  return (
    <>
      <ambientLight intensity={1.16} color="#fff1c9" />
      <directionalLight position={[4, 5, 5]} intensity={1.08} color="#fff0b8" />
      <directionalLight position={[-4, 2, 3]} intensity={0.32} color="#ffdca0" />
      <pointLight position={[0, 2, 3]} intensity={0.22} color="#ffc96f" />
    </>
  );
}
