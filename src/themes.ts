export type Theme = {
  color: string;
  secondary: string;
  background: string;
  star: string;
  tab: string;
  tabLabel: string;
  gradient?: string;
};

export type ThemePair = {
  name: string;
  label: string;
  light: Theme;
  dark: Theme;
};

const THEMES: Record<string, ThemePair> = {
  default: {
    name: "default",
    label: "Default",
    light: {
      color: "#000000",
      secondary: "#9ca3af",
      background: "#ffffff",
      star: "#eab308",
      tab: "#bfdbfe",
      tabLabel: "#000000",
    },
    dark: {
      color: "#ffffff",
      secondary: "#9ca3af",
      background: "#000000",
      star: "#fde047",
      tab: "#1e40af",
      tabLabel: "#ffffff",
    },
  },
  dim: {
    name: "dim",
    label: "Dim",
    light: {
      color: "#000000",
      secondary: "#9ca3af",
      background: "#F3F4F6",
      star: "#eab308",
      tab: "#bfdbfe",
      tabLabel: "#000000",
    },
    dark: {
      color: "#ffffff",
      secondary: "#9ca3af",
      background: "#1f2937",
      star: "#fde047",
      tab: "#1e40af",
      tabLabel: "#ffffff",
    },
  },
  pink: {
    name: "pink",
    label: "Pink",
    light: {
      color: "#000000",
      secondary: "#475569",
      background: "#fbcfe8",
      star: "#000000",
      tab: "#000000",
      tabLabel: "#fbcfe8",
    },
    dark: {
      color: "#ffffff",
      secondary: "#d1d5db",
      background: "#ec4899",
      star: "#ffffff",
      tab: "#ffffff",
      tabLabel: "#ec4899",
    },
  },
  teal: {
    name: "teal",
    label: "Teal",
    light: {
      color: "#134e4a",
      secondary: "#0f766e",
      background: "#99f6e4",
      star: "#134e4a",
      tab: "#99f6e4",
      tabLabel: "#134e4a",
    },
    dark: {
      color: "#ede9fe",
      secondary: "#ede9fe",
      background: "#43b0ba",
      star: "#ede9fe",
      tab: "#ede9fe",
      tabLabel: "#000000",
    },
  },
  hacker: {
    name: "hacker",
    label: "Hacker",
    light: {
      color: "#bef264",
      secondary: "#65a30d",
      background: "#000000",
      star: "#bef264",
      tab: "#bef264",
      tabLabel: "#000000",
    },
    dark: {
      color: "#bef264",
      secondary: "#65a30d",
      background: "#000000",
      star: "#bef264",
      tab: "#bef264",
      tabLabel: "#000000",
    },
  },
  purple: {
    name: "purple",
    label: "Purple",
    light: {
      color: "#ede9fe",
      secondary: "#c4b5fd",
      background: "#5b21b6",
      star: "#ede9fe",
      tab: "#ede9fe",
      tabLabel: "#5b21b6",
    },
    dark: {
      color: "#ede9fe",
      secondary: "#c4b5fd",
      background: "#5b21b6",
      star: "#ede9fe",
      tab: "#ede9fe",
      tabLabel: "#5b21b6",
    },
  },
  silver: {
    name: "silver",
    label: "Silver",
    light: {
      color: "#000000",
      secondary: "#475569",
      background: "#e2e8f0",
      star: "#475569",
      tab: "#475569",
      tabLabel: "#ffffff",
    },
    dark: {
      color: "#ffffff",
      secondary: "#e2e8f0",
      background: "#475569",
      star: "#e2e8f0",
      tab: "#e2e8f0",
      tabLabel: "#000000",
    },
  },
  trans: {
    name: "trans",
    label: "Trans",
    light: {
      color: "#000000",
      secondary: "#9ca3af",
      background: "#ffffff",
      star: "#eab308",
      tab: "#5BCEFA",
      tabLabel: "#000000",
      gradient:
        "linear-gradient(-45deg, #5BCEFA, #5BCEFA, #ffffff, #ffffff, #F5A9B8, #F5A9B8)",
    },
    dark: {
      color: "#000000",
      secondary: "#9ca3af",
      background: "#ffffff",
      star: "#eab308",
      tab: "#5BCEFA",
      tabLabel: "#000000",
      gradient:
        "linear-gradient(-45deg, #5BCEFA, #5BCEFA, #ffffff, #ffffff, #F5A9B8, #F5A9B8)",
    },
  },
  lesbian: {
    name: "lesbian",
    label: "Lesbian",
    light: {
      color: "#000000",
      secondary: "#ffffff",
      background: "#ffffff",
      star: "#fd9855",
      tab: "#a20161",
      tabLabel: "#ffffff",
      gradient:
        "linear-gradient(45deg, #d42c00, #fd9855, #ffffff, #ffffff, #d161a2, #a20161)",
    },
    dark: {
      color: "#000000",
      secondary: "#ffffff",
      background: "#ffffff",
      star: "#fd9855",
      tab: "#d42c00",
      tabLabel: "#ffffff",
      gradient:
        "linear-gradient(45deg, #d42c00, #fd9855, #ffffff, #ffffff, #d161a2, #a20161)",
    },
  },
  bisexual: {
    name: "bisexual",
    label: "Bisexual",
    light: {
      color: "#ffffff",
      secondary: "#bae6fd",
      background: "#000000",
      star: "#D60270",
      tab: "#0038A8",
      tabLabel: "#ffffff",
      gradient: "linear-gradient(45deg, #D60270, #9B4F96, #0038A8)",
    },
    dark: {
      color: "#ffffff",
      secondary: "#bae6fd",
      background: "#000000",
      star: "#D60270",
      tab: "#0038A8",
      tabLabel: "#ffffff",
      gradient: "linear-gradient(45deg, #D60270, #9B4F96, #0038A8)",
    },
  },
  maine: {
    name: "maine",
    label: "Maine",
    light: {
      color: "#00512C",
      secondary: "#3B3C6E",
      background: "#EDE8CE",
      star: "#3B3C6E",
      tab: "#bfdbfe",
      tabLabel: "#00512C",
    },
    dark: {
      color: "#00512C",
      secondary: "#3B3C6E",
      background: "#EDE8CE",
      star: "#3B3C6E",
      tab: "#bfdbfe",
      tabLabel: "#00512C",
    },
  },
  canada: {
    name: "canada",
    label: "Canada",
    light: {
      color: "#000000",
      secondary: "#d52b1e",
      background: "#ffffff",
      star: "#d52b1e",
      tab: "#d52b1e",
      tabLabel: "#ffffff",
      gradient: "center / cover no-repeat url(/canada.svg)",
    },
    dark: {
      color: "#000000",
      secondary: "#d52b1e",
      background: "#ffffff",
      star: "#d52b1e",
      tab: "#d52b1e",
      tabLabel: "#ffffff",
      gradient: "center / cover no-repeat url(/canada.svg)",
    },
  },
};

export default THEMES;
