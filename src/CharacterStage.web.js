import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";

export function CharacterStage({ character }) {
  return (
    <Canvas camera={{ position: [0, 0.45, 5.5], fov: 25 }} dpr={[1, 2]}>
      <color attach="background" args={["#f8fbff"]} />
      <ambientLight intensity={1.25} />
      <directionalLight position={[4, 5, 5]} intensity={1.45} />
      <directionalLight position={[-4, 2, 3]} intensity={0.6} color="#d8efff" />
      <pointLight position={[0, 2, 3]} intensity={0.45} color="#fff4df" />
      <ShowcaseRig>
        <ClassModel character={character} />
      </ShowcaseRig>
    </Canvas>
  );
}

function ShowcaseRig({ children }) {
  const ref = useRef(null);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = -0.28;
    ref.current.rotation.x = 0.05 + Math.cos(state.clock.elapsedTime * 0.65) * 0.015;
    ref.current.position.y = Math.sin(state.clock.elapsedTime * 1.3) * 0.025;
  });

  return <group ref={ref}>{children}</group>;
}

function ClassModel({ character }) {
  if (character.id === "mage") return <MageModel character={character} />;
  if (character.id === "pirate") return <PirateModel character={character} />;
  return <WarriorModel character={character} />;
}

function WarriorModel({ character }) {
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

function MageModel({ character }) {
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
        <meshStandardMaterial color={character.palette.accent} emissive={character.palette.accent} emissiveIntensity={0.14} />
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

function PirateModel({ character }) {
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

function BodyBase({ palette, outfitShape, hairStyle, sleeveColor }) {
  const skin = palette.skin ?? "#ffe0ca";
  const shoeColor = useMemo(() => shade(palette.primary, -24), [palette.primary]);

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

function HairFront({ hairColor, hairStyle }) {
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

function FaceFeatures() {
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
