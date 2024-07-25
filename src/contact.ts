export interface Contact {
  cardType: "person" | "repeater";
  name: string;
  location: string;
  callsign: string;
  star?: boolean;
  website?: string;
  frequency?: number;
  offset?: number;
  toneUp?: number;   
  toneDown?: number;
}