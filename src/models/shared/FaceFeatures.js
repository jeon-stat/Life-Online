export function FaceFeatures() {
  return (
    <group>
      <mesh position={[-0.24, 1.18, 0.67]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial color="#283248" />
      </mesh>
      <mesh position={[0.24, 1.18, 0.67]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial color="#283248" />
      </mesh>
      <mesh position={[0, 0.94, 0.69]} scale={[1.3, 0.5, 0.5]}>
        <sphereGeometry args={[0.06, 14, 14]} />
        <meshStandardMaterial color="#d88b8a" />
      </mesh>
      <mesh position={[-0.38, 0.98, 0.65]} scale={[1.4, 0.75, 0.55]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#ffc8c3" transparent opacity={0.75} />
      </mesh>
      <mesh position={[0.38, 0.98, 0.65]} scale={[1.4, 0.75, 0.55]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#ffc8c3" transparent opacity={0.75} />
      </mesh>
    </group>
  );
}
