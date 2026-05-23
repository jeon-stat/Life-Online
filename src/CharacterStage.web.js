import { StageCanvas } from "./scene/StageCanvas.web.js";
import { StageRig } from "./scene/StageRig.js";
import { MageModel } from "./models/MageModel.js";
import { PirateModel } from "./models/PirateModel.js";
import { WarriorModel } from "./models/WarriorModel.js";

export function CharacterStage({ character }) {
  return (
    <StageCanvas>
      <StageRig>
        <ClassModel character={character} />
      </StageRig>
    </StageCanvas>
  );
}

function ClassModel({ character }) {
  if (character.id === "mage") return <MageModel character={character} />;
  if (character.id === "pirate") return <PirateModel character={character} />;
  return <WarriorModel character={character} />;
}
