export interface Contact {
  cardType: "person" | "repeater";
  name: string;
  callsign: string;
  star?: boolean;
  website?: string;
  location: string;
  frequency?: number;
  offset?: number;
  toneUp?: number;   
  toneDown?: number;
}