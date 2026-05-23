import { BodyBase } from "./shared/BodyBase.js";

export function MageModel({ character }) {
  return (
    <group position={[0, -1.08, 0]}>
      <BodyBase
        palette={character.palette}
        outfitShape="robe"
        hairStyle="long-curl"
        sleeveColor="#f7f0ff"
      />
      <mesh position={[0, 1.95, 0]} rotation={[0, 0, -0.05]}>
        <cylinderGeometry args={[0.92, 1.04, 0.14, 32]} />
        <meshStandardMaterial color={character.palette.primary} />
      </mesh>
      <mesh position={[0, 2.22, 0]} rotation={[0, 0, -0.05]}>
        <coneGeometry args={[0.7, 1.2, 32]} />
        <meshStandardMaterial color={character.palette.primary} />
      </mesh>
      <mesh position={[0.12, 2.68, 0.14]} rotation={[0.25, 0.2, -0.15]}>
        <coneGeometry args={[0.18, 0.45, 12]} />
        <meshStandardMaterial
          color={character.palette.accent}
          emissive={character.palette.accent}
          emissiveIntensity={0.14}
        />
      </mesh>
      <mesh position={[0, 0.12, 0.46]}>
        <boxGeometry args={[1.02, 1.82, 0.14]} />
        <meshStandardMaterial color={character.palette.primary} />
      </mesh>
      <mesh position={[0, -0.78, 0.58]}>
        <boxGeometry args={[0.82, 0.36, 0.14]} />
        <meshStandardMaterial color={character.palette.secondary} />
      </mesh>
      <mesh position={[1.02, 0.36, 0.16]} rotation={[0.02, 0.04, -0.08]}>
        <cylinderGeometry args={[0.08, 0.08, 1.75, 16]} />
        <meshStandardMaterial color="#d6c39d" />
      </mesh>
      <mesh position={[1.1, 1.2, 0.2]}>
        <sphereGeometry args={[0.26, 24, 24]} />
        <meshStandardMaterial
          color={character.palette.accent}
          emissive={character.palette.accent}
          emissiveIntensity={0.28}
        />
      </mesh>
      <mesh position={[1.1, 1.2, 0.2]} rotation={[0.75, 0.2, 0.35]}>
        <torusGeometry args={[0.34, 0.04, 10, 28]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.72} />
      </mesh>
      <mesh position={[-0.82, 0.9, 0.32]}>
        <sphereGeometry args={[0.15, 18, 18]} />
        <meshStandardMaterial color="#fff4ca" emissive="#fff4ca" emissiveIntensity={0.18} />
      </mesh>
    </group>
  );
}
