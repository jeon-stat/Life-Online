import { BodyBase } from "./shared/BodyBase.js";

export function WarriorModel({ character }) {
  return (
    <group position={[0, -1.08, 0]}>
      <BodyBase
        palette={character.palette}
        outfitShape="armor"
        hairStyle="bangs"
        sleeveColor="#f7fbff"
      />
      <mesh position={[0, 0.38, 0.55]}>
        <boxGeometry args={[1.18, 0.9, 0.18]} />
        <meshStandardMaterial color={character.palette.primary} />
      </mesh>
      <mesh position={[-0.67, 0.7, 0.28]} rotation={[0.15, 0.12, 0.2]}>
        <sphereGeometry args={[0.25, 20, 20]} />
        <meshStandardMaterial color="#eef3ff" metalness={0.2} roughness={0.35} />
      </mesh>
      <mesh position={[0.67, 0.7, 0.28]} rotation={[0.15, -0.12, -0.2]}>
        <sphereGeometry args={[0.25, 20, 20]} />
        <meshStandardMaterial color="#eef3ff" metalness={0.2} roughness={0.35} />
      </mesh>
      <mesh position={[0.12, 0.98, 0.3]}>
        <boxGeometry args={[0.95, 0.26, 0.12]} />
        <meshStandardMaterial color="#f4f8ff" metalness={0.15} roughness={0.35} />
      </mesh>
      <mesh position={[1.12, 0.08, -0.18]} rotation={[0.1, 0.16, -0.8]}>
        <boxGeometry args={[0.18, 2.12, 0.18]} />
        <meshStandardMaterial color="#d8dfef" metalness={0.35} roughness={0.35} />
      </mesh>
      <mesh position={[1.48, 0.88, -0.02]} rotation={[0, 0, 0.72]}>
        <boxGeometry args={[0.42, 1.28, 0.14]} />
        <meshStandardMaterial color="#f6f8fc" metalness={0.5} roughness={0.28} />
      </mesh>
      <mesh position={[1.46, 0.16, -0.02]} rotation={[0, 0, 0.72]}>
        <coneGeometry args={[0.24, 0.34, 5]} />
        <meshStandardMaterial color={character.palette.accent} />
      </mesh>
      <mesh position={[0.02, -0.02, 0.6]}>
        <boxGeometry args={[0.56, 0.11, 0.1]} />
        <meshStandardMaterial color={character.palette.accent} />
      </mesh>
    </group>
  );
}
