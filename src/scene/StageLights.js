export function StageLights() {
  return (
    <>
      <ambientLight intensity={1.24} color="#fff3e6" />
      <directionalLight position={[4, 5, 5]} intensity={1.18} color="#fff1dc" />
      <directionalLight position={[-4, 2, 3]} intensity={0.42} color="#ffe2cb" />
      <pointLight position={[0, 2, 3]} intensity={0.3} color="#ffd8bc" />
    </>
  );
}
