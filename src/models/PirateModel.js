import { BodyBase } from "./shared/BodyBase.js";

export function PirateModel({ character }) {
  return (
    <group position={[0, -1.08, 0]}>
      <BodyBase
        palette={character.palette}
        outfitShape="coat"
        hairStyle="side-sweep"
        sleeveColor="#eef7fb"
      />
      <mesh position={[0, 1.98, 0]} rotation={[0, 0, 0.02]}>
        <cylinderGeometry args={[0.8, 0.86, 0.16, 28]} />
        <meshStandardMaterial color={character.palette.primary} />
      </mesh>
      <mesh position={[-0.58, 2.05, 0]} rotation={[0, 0, 0.7]}>
        <boxGeometry args={[0.58, 0.16, 0.5]} />
        <meshStandardMaterial color={character.palette.primary} />
      </mesh>
      <mesh position={[0.58, 2.05, 0]} rotation={[0, 0, -0.7]}>
        <boxGeometry args={[0.58, 0.16, 0.5]} />
        <meshStandardMaterial color={character.palette.primary} />
      </mesh>
      <mesh position={[0, 1.76, 0.36]}>
        <boxGeometry args={[1.02, 0.12, 0.15]} />
        <meshStandardMaterial color={character.palette.accent} />
      </mesh>
      <mesh position={[0, 0.2, 0.5]}>
        <boxGeometry args={[0.96, 1.58, 0.14]} />
        <meshStandardMaterial color={character.palette.primary} />
      </mesh>
      <mesh position={[-0.26, -0.54, 0.42]} rotation={[0.1, 0, 0.08]}>
        <boxGeometry args={[0.3, 1.12, 0.1]} />
        <meshStandardMaterial color={character.palette.primary} />
      </mesh>
      <mesh position={[0.26, -0.54, 0.42]} rotation={[0.1, 0, -0.08]}>
        <boxGeometry args={[0.3, 1.12, 0.1]} />
        <meshStandardMaterial color={character.palette.primary} />
      </mesh>
      <mesh position={[0, -0.05, 0.58]}>
        <boxGeometry args={[0.82, 0.14, 0.1]} />
        <meshStandardMaterial color={character.palette.accent} />
      </mesh>
      <mesh position={[1.06, 0.32, 0.18]} rotation={[0.1, 0.18, -0.3]}>
        <boxGeometry args={[0.14, 1.1, 0.1]} />
        <meshStandardMaterial color="#d8e0ef" metalness={0.45} roughness={0.35} />
      </mesh>
      <mesh position={[1.32, 0.78, 0.2]} rotation={[0, 0.18, 0.15]}>
        <coneGeometry args={[0.16, 0.34, 5]} />
        <meshStandardMaterial color="#f8fafd" metalness={0.25} roughness={0.3} />
      </mesh>
      <mesh position={[-0.94, 0.12, 0.24]} rotation={[0, 0, 0.35]}>
        <torusGeometry args={[0.2, 0.055, 12, 24, Math.PI * 1.25]} />
        <meshStandardMaterial color={character.palette.accent} />
      </mesh>
      <mesh position={[-0.81, -0.05, 0.22]}>
        <boxGeometry args={[0.08, 0.2, 0.08]} />
        <meshStandardMaterial color="#fff4e2" />
      </mesh>
    </group>
  );
}
