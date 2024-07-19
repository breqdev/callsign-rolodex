import JSZip from "jszip";
import { Contact } from "./contact";

export async function generateVCard(c: Contact) {
  let vcf = "BEGIN:VCARD\n";
  vcf += "VERSION:4.0\n";

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

  // do our best to encode the callsign in a way that will be usable by other software
  // there's no field for it, and to my knowledge there's no other software that stores callsigns in .vcf, but we can still strive for standardization

  // first approach: vendor namespace
  // TODO: I am currently waiting on a PEN from IANA
  // https://datatracker.ietf.org/doc/html/rfc6350#section-10.2.2
  // vcf += `VND-XXXXXX-CALLSIGN:${c.callsign}\n`;

  // second approach: X-name
  // https://datatracker.ietf.org/doc/html/rfc6350#section-3.3
  vcf += `X-CALLSIGN:${c.callsign}\n`;

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
