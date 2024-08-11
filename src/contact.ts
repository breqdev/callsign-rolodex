export interface Contact {
  cardType: "person" | "repeater";
  name: string;
  location: string;
  callsign: string;
  star?: boolean;
  website?: string;
  frequency?: number;
  offset?: number;
  txTone?: number;
  rxTone?: number;
  txToneMode?: "DCS" | "CTCSS";
  rxToneMode?: "DCS" | "CTCSS";
  theme?: string;
}
