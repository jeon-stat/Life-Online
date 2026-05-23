export function HairFront({ hairColor, hairStyle }) {
  if (hairStyle === "long-curl") {
    return (
      <group>
        <mesh position={[0, 1.56, 0.38]} scale={[1.02, 0.72, 0.84]}>
          <sphereGeometry args={[0.72, 28, 28]} />
          <meshStandardMaterial color={hairColor} />
        </mesh>
        <mesh position={[-0.54, 0.92, 0.1]} rotation={[0.1, 0.08, 0.08]}>
          <capsuleGeometry args={[0.12, 0.78, 8, 16]} />
          <meshStandardMaterial color={hairColor} />
        </mesh>
        <mesh position={[0.54, 0.92, 0.1]} rotation={[0.1, -0.08, -0.08]}>
          <capsuleGeometry args={[0.12, 0.78, 8, 16]} />
          <meshStandardMaterial color={hairColor} />
        </mesh>
      </group>
    );
  }

  if (hairStyle === "side-sweep") {
    return (
      <group>
        <mesh position={[0, 1.54, 0.38]} scale={[1, 0.68, 0.82]}>
          <sphereGeometry args={[0.7, 28, 28]} />
          <meshStandardMaterial color={hairColor} />
        </mesh>
        <mesh position={[-0.3, 1.38, 0.58]} rotation={[0, 0, -0.34]}>
          <capsuleGeometry args={[0.1, 0.48, 8, 16]} />
          <meshStandardMaterial color={hairColor} />
        </mesh>
        <mesh position={[0.34, 1.2, 0.52]} rotation={[0, 0, 0.16]}>
          <capsuleGeometry args={[0.08, 0.26, 8, 16]} />
          <meshStandardMaterial color={hairColor} />
        </mesh>
      </group>
    );
  }

  return (
    <group>
      <mesh position={[0, 1.56, 0.38]} scale={[1.02, 0.7, 0.84]}>
        <sphereGeometry args={[0.72, 28, 28]} />
        <meshStandardMaterial color={hairColor} />
      </mesh>
      <mesh position={[-0.36, 1.34, 0.56]} rotation={[0, 0, -0.18]}>
        <capsuleGeometry args={[0.09, 0.34, 8, 16]} />
        <meshStandardMaterial color={hairColor} />
      </mesh>
      <mesh position={[0, 1.24, 0.6]}>
        <capsuleGeometry args={[0.09, 0.4, 8, 16]} />
        <meshStandardMaterial color={hairColor} />
      </mesh>
      <mesh position={[0.36, 1.34, 0.56]} rotation={[0, 0, 0.18]}>
        <capsuleGeometry args={[0.09, 0.34, 8, 16]} />
        <meshStandardMaterial color={hairColor} />
      </mesh>
    </group>
  );
}
