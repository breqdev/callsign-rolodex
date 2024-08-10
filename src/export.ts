import JSZip from "jszip";
import { Contact } from "./contact";

export async function generateVCard(c: Contact) {
  let vcf = "BEGIN:VCARD\n";
  vcf += "VERSION:4.0\n";

  // do our best to encode the callsign in a way that will be usable by other software
  // there's no field for it, and to my knowledge there's no other software that stores callsigns in .vcf, but we can still strive for standardization

  // first approach: vendor namespace
  // https://datatracker.ietf.org/doc/html/rfc6350#section-10.2.2
  vcf += `VND-62187-CALLSIGN:${c.callsign}\n`;

  // second approach: X-name
  // https://datatracker.ietf.org/doc/html/rfc6350#section-3.3
  vcf += `X-CALLSIGN:${c.callsign}\n`;
  vcf += `X-STATION-TYPE:${c.cardType}\n`;

  // this is hopefully not that wrong
  if (c.cardType == "repeater") {
    vcf += `FN:${c.callsign}\n`;
    vcf += `ADR:${c.location}\n`;

    // format: "X-REPEATER-INFO:(freq);(offset);(txToneMode);(txTone);(rxToneMode);(rxTone);"
    vcf += `X-REPEATER-INFO:`
    
    if (c.frequency) {
      vcf += `${c.frequency}`;
    }
    vcf += `;`
    if (c.offset) {
      vcf += `${c.offset}`;
    }
    vcf += `;`
    if (c.txToneMode) {
      vcf += `${c.txToneMode}`
    }
    vcf += `;`
    if (c.txTone) {
      vcf += `${c.txTone}`;
    }
    vcf += `;`
    if (c.rxToneMode) {
      vcf += `${c.rxToneMode}`
    }
    vcf += `;`
    if (c.rxTone) {
      vcf += `${c.rxTone}`
    }
    vcf += `;\n`
    
  } 
  else {
    vcf += `FN:${c.name}\n`;

    // TODO: this is likely going to be wrong for many people, but .vcf's need to have names in a structured format, so do our best to split into family/given/middle
    const names = c.name.split(" ");
    const family_name = names[names.length - 1];
    const given_name = names[0];
    const middle_names = names.slice(1, names.length - 1).join(" ");

    vcf += `N:${family_name};${given_name};${middle_names};;\n`;

    if (c.website) {
      vcf += `URL:${c.website}\n`;
    }
  }

  vcf += "END:VCARD\n";

  const blob = new Blob([vcf], { type: "text/vcard" });
  return blob;
}

export async function generateJson(c: Contact) {
  return new Blob([JSON.stringify(c)], { type: "application/json" });
}

export async function generateZip(
  contacts: Contact[],
  exporter: (c: Contact) => Promise<Blob>
) {
  const zip = new JSZip();

  contacts.forEach((c) => {
    zip.file(`${c.callsign}.vcf`, exporter(c));
  });

  return await zip.generateAsync({ type: "blob" });
}
