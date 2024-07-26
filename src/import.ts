import JSZip from "jszip";
import { Contact } from "./contact";
import { parse } from "@fortawesome/fontawesome-svg-core";

export async function importVCard(file: File): Promise<Contact> {
  const text = await file.text();

  const lines = text.split("\n");
  const contact: Partial<Contact> = {};

  for (const line of lines) {
    const [key, value] = line.split(":");
    switch (key) {
      case "FN":
        contact.name = value;
        break;
      case "N": {
        if (!contact.name) {
          // only use this if FN isn't provided
          const [family_name, given_name, middle_names] = value.split(";");
          contact.name = `${given_name} ${middle_names} ${family_name}`;
        }
        break;
      }
      case "URL":
        contact.website = value;
        break;
      case "X-CALLSIGN":
        contact.callsign = value;
        break;
      case "X-STATION-TYPE":
        contact.cardType = value == "repeater" ? "repeater" : "person";
        break;
      case "X-LOCATION":
        contact.location = value;
        break;
      case "X-REPEATER-INFO":
        const [frequency, offset, tone, rxtone] = value.split(";");
        contact.frequency = frequency != "" ? parseFloat(frequency) : undefined;
        contact.offset = offset != "" ? parseFloat(offset) : undefined;
        contact.tone = tone != "" ? parseFloat(tone) : undefined;
        contact.rxtone = rxtone != "" ? parseFloat(rxtone) : undefined;
        break;
    }
  }

  return contact as Contact;
}

export async function importJson(file: File): Promise<Contact> {
  const text = await file.text();
  return JSON.parse(text);
}

export async function importZip(file: File): Promise<Contact[]> {
  const zip = await JSZip.loadAsync(file);
  const contacts: Contact[] = [];

  for (const [name, blob] of Object.entries(zip.files)) {
    if (name.endsWith(".vcf")) {
      const text = await blob.async("text");
      const contact = await importVCard(new File([text], name));
      contacts.push(contact);
    }

    if (name.endsWith(".json")) {
      const text = await blob.async("text");
      const contact = await importJson(new File([text], name));
      contacts.push(contact);
    }
  }

  return contacts;
}
