export const STAGE_MODE = "character-only";

export const CHARACTER_CLASSES = [
  {
    id: "warrior",
    label: "\uc804\uc0ac",
    blurb:
      "\ud070 \uac80\uacfc \uac11\uc637 \uc2e4\ub8e8\uc5e3\uc774 \uba3c\uc800 \ubcf4\uc774\ub294, \uadc0\uc5ec\uc6b4 SD \ube44\uc728\uc758 \uadfc\uc811 \uc804\ud22c \uce90\ub9ad\ud130",
    modelSignature: ["broad-shoulders", "great-sword", "armor-bangs"],
    palette: {
      primary: "#5e70db",
      secondary: "#edf2ff",
      accent: "#f7bf43",
      hair: "#5b4033",
      skin: "#ffe0ca",
    },
  },
  {
    id: "mage",
    label: "\ub9c8\ubc95\uc0ac",
    blurb:
      "\ub113\uc740 \ubaa8\uc790\uc640 \ub85c\ube0c, \ube5b\ub098\ub294 \uc9c0\ud321\uc774\uac00 \uc2e4\ub8e8\uc5e3\uc744 \ub9cc\ub4dc\ub294 \ubd80\ub4dc\ub7ec\uc6b4 \uc8fc\ubb38\ud615 \uce90\ub9ad\ud130",
    modelSignature: ["wide-hat", "long-robe", "staff-orb"],
    palette: {
      primary: "#8a63ea",
      secondary: "#f3edff",
      accent: "#79ebff",
      hair: "#6d4b73",
      skin: "#ffe2d2",
    },
  },
  {
    id: "pirate",
    label: "\ud574\uc801",
    blurb:
      "\uc0bc\uac01 \ubaa8\uc790\uc640 \ub86f \ucf54\ud2b8, \ub0a0\ub798 \uc18c\ud488\uc774 \ub3cb\ubcf4\uc774\ub294 \ud65c\ubc1c\ud55c \ub9ac\ub4ec\uc758 \uce90\ub9ad\ud130",
    modelSignature: ["tricorn-hat", "long-coat", "hook-blade"],
    palette: {
      primary: "#245e71",
      secondary: "#e3f7fb",
      accent: "#f27155",
      hair: "#43302e",
      skin: "#ffd9c3",
    },
  },
];
