function FaceArc({ position, rotation, color }) {
  return (
    <mesh position={position} rotation={rotation}>
      <torusGeometry args={[0.32, 0.045, 12, 48, Math.PI]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

export function PongoModel({ character }) {
  const palette = character.palette;

  return (
    <group position={[0, -1.08, 0]}>
      <mesh position={[0, 1.26, 0]} scale={[1.18, 1.14, 1.08]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={palette.primary} roughness={0.72} />
      </mesh>

      <mesh position={[0, 1.95, 0]} scale={[1, 0.88, 1]}>
        <sphereGeometry args={[0.54, 28, 28]} />
        <meshStandardMaterial color={palette.hat} roughness={0.74} />
      </mesh>
      <mesh position={[0, 1.55, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.72, 0.72, 0.08, 32]} />
        <meshStandardMaterial color={palette.trim} roughness={0.66} />
      </mesh>

      <mesh position={[0, 0.14, 0]} scale={[1.08, 0.92, 0.92]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={palette.primary} roughness={0.78} />
      </mesh>

      <mesh position={[-0.82, 0.1, 0]} rotation={[0, 0, 0.1]}>
        <capsuleGeometry args={[0.13, 0.62, 10, 18]} />
        <meshStandardMaterial color={palette.primary} roughness={0.8} />
      </mesh>
      <mesh position={[0.82, 0.1, 0]} rotation={[0, 0, -0.1]}>
        <capsuleGeometry args={[0.13, 0.62, 10, 18]} />
        <meshStandardMaterial color={palette.primary} roughness={0.8} />
      </mesh>

      <mesh position={[-0.32, -0.82, 0]} scale={[0.46, 0.9, 0.48]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={palette.primary} roughness={0.82} />
      </mesh>
      <mesh position={[0.32, -0.82, 0]} scale={[0.46, 0.9, 0.48]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={palette.primary} roughness={0.82} />
      </mesh>

      <mesh position={[-0.16, 1.22, 0.61]}>
        <sphereGeometry args={[0.085, 16, 16]} />
        <meshStandardMaterial color={palette.detail} />
      </mesh>
      <mesh position={[0.16, 1.22, 0.61]}>
        <sphereGeometry args={[0.085, 16, 16]} />
        <meshStandardMaterial color={palette.detail} />
      </mesh>
      <mesh position={[0, 1.02, 0.64]} scale={[0.58, 0.44, 0.46]}>
        <sphereGeometry args={[0.11, 18, 18]} />
        <meshStandardMaterial color={palette.trim} />
      </mesh>
      <FaceArc position={[0, 1.06, 0.62]} rotation={[0, 0, Math.PI]} color={palette.accent} />
    </group>
  );
}
