import { FaceFeatures } from "./FaceFeatures.js";
import { HairFront } from "./HairFront.js";

export function BodyBase({ palette, outfitShape, hairStyle, sleeveColor }) {
  const skin = palette.skin ?? "#ffe0ca";
  const shoeColor = shade(palette.primary, -24);

  return (
    <group>
      <mesh position={[0, 1.2, 0]}>
        <sphereGeometry args={[0.74, 32, 32]} />
        <meshStandardMaterial color={skin} />
      </mesh>

      <mesh position={[0, 1.42, -0.18]} scale={[1.04, 0.9, 0.96]}>
        <sphereGeometry args={[0.8, 28, 28]} />
        <meshStandardMaterial color={palette.hair} />
      </mesh>

      <HairFront hairColor={palette.hair} hairStyle={hairStyle} />
      <FaceFeatures />

      <mesh position={[0, 0.18, 0]} scale={getTorsoScale(outfitShape)}>
        <boxGeometry args={[1, 1.36, 0.7]} />
        <meshStandardMaterial color={palette.secondary} />
      </mesh>

      <mesh position={[0, 0.46, 0.38]}>
        <boxGeometry args={[0.72, 0.42, 0.08]} />
        <meshStandardMaterial color={palette.primary} />
      </mesh>

      <mesh position={[0, -0.08, 0.42]}>
        <boxGeometry args={[0.58, 0.1, 0.08]} />
        <meshStandardMaterial color={palette.primary} />
      </mesh>

      <mesh position={[-0.86, 0.2, 0.06]} rotation={[0, 0, 0.18]}>
        <capsuleGeometry args={[0.17, 0.9, 8, 16]} />
        <meshStandardMaterial color={sleeveColor} />
      </mesh>
      <mesh position={[0.86, 0.2, 0.06]} rotation={[0, 0, -0.18]}>
        <capsuleGeometry args={[0.17, 0.9, 8, 16]} />
        <meshStandardMaterial color={sleeveColor} />
      </mesh>
      <mesh position={[-0.96, -0.42, 0.14]}>
        <sphereGeometry args={[0.18, 18, 18]} />
        <meshStandardMaterial color={skin} />
      </mesh>
      <mesh position={[0.96, -0.42, 0.14]}>
        <sphereGeometry args={[0.18, 18, 18]} />
        <meshStandardMaterial color={skin} />
      </mesh>

      <mesh position={[-0.28, -0.94, 0.02]}>
        <capsuleGeometry args={[0.18, 0.8, 8, 16]} />
        <meshStandardMaterial color="#f6f8ff" />
      </mesh>
      <mesh position={[0.28, -0.94, 0.02]}>
        <capsuleGeometry args={[0.18, 0.8, 8, 16]} />
        <meshStandardMaterial color="#f6f8ff" />
      </mesh>

      <mesh position={[-0.3, -1.5, 0.16]} scale={[1.15, 0.72, 1.8]}>
        <sphereGeometry args={[0.24, 18, 18]} />
        <meshStandardMaterial color={shoeColor} />
      </mesh>
      <mesh position={[0.3, -1.5, 0.16]} scale={[1.15, 0.72, 1.8]}>
        <sphereGeometry args={[0.24, 18, 18]} />
        <meshStandardMaterial color={shoeColor} />
      </mesh>
    </group>
  );
}

function getTorsoScale(outfitShape) {
  if (outfitShape === "robe") return [1.14, 1.38, 0.92];
  if (outfitShape === "coat") return [1.08, 1.32, 0.94];
  return [1.04, 1.18, 0.92];
}

function shade(color, amount) {
  const hex = color.replace("#", "");
  const num = Number.parseInt(hex, 16);
  const clamp = (value) => Math.max(0, Math.min(255, value));
  const red = clamp((num >> 16) + amount);
  const green = clamp(((num >> 8) & 0xff) + amount);
  const blue = clamp((num & 0xff) + amount);
  return `#${((red << 16) | (green << 8) | blue).toString(16).padStart(6, "0")}`;
}
