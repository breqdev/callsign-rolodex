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
    vcf += `X-REPEATER-INFO:`;

    if (c.frequency) {
      vcf += `${c.frequency}`;
    }
    vcf += `;`;
    if (c.offset) {
      vcf += `${c.offset}`;
    }
    vcf += `;`;
    if (c.txToneMode) {
      vcf += `${c.txToneMode}`;
    }
    vcf += `;`;
    if (c.txTone) {
      vcf += `${c.txTone}`;
    }
    vcf += `;`;
    if (c.rxToneMode) {
      vcf += `${c.rxToneMode}`;
    }
    vcf += `;`;
    if (c.rxTone) {
      vcf += `${c.rxTone}`;
    }
    vcf += `;\n`;
  } else {
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

export async function generateCsvRowChirp(
  contact: Contact,
  idx: number
): Promise<string[]> {
  // Location	Name	Frequency	Duplex	Offset	Tone	rToneFreq	cToneFreq	DtcsCode	DtcsPolarity	RxDtcsCode	CrossMode	Mode	TStep	Skip	Power	Comment

  // tone modes:
  // - TSQL is tx/rx tone
  // - Tone is tx tone
  // - DTCS
  // - Cross is for both tone and dtcs
  // or can be empty

  let tone: string;
  if (contact.txToneMode === "CTCSS" && contact.rxToneMode === "CTCSS") {
    tone = "TSQL";
  } else if (
    contact.txToneMode === "CTCSS" &&
    contact.rxToneMode === undefined
  ) {
    tone = "Tone";
  } else if (contact.txToneMode === "DCS" && contact.rxToneMode === "DCS") {
    tone = "DTCS";
  } else {
    alert("This combination of TX/RX tone not yet supported!");
    throw Error("This combination of TX/RX tone not yet supported");
  }

  return [
    idx.toString(),
    contact.callsign.slice(0, 7),
    contact.frequency?.toString() ?? "",
    contact.offset
      ? contact.offset < 0
        ? "-"
        : contact.offset > 0
        ? "+"
        : ""
      : "",
    Math.abs(contact.offset ?? 0).toString(),
    tone,
    contact.rxToneMode === "CTCSS" ? contact.rxTone!.toString() : "",
    contact.txToneMode === "CTCSS" ? contact.txTone!.toString() : "",
    contact.rxToneMode === "DCS" ? contact.rxTone!.toString() : "",
    "NN", // TODO: DCS polarity
    contact.txToneMode === "DCS" ? contact.txTone!.toString() : "",
    "Tone->Tone", // TODO: cross mode
    "FM", // TODO: support NFM (12.5 kHz bandwidth)
    "5", // TStep, not used
    "", // Skip, not used
    "5.0", // Power
    contact.location ?? contact.name, // comment
  ];
}

export async function generateCsvChirp(contacts: Contact[]): Promise<Blob> {
  const header = [
    "Location",
    "Name",
    "Frequency",
    "Duplex",
    "Offset",
    "Tone",
    "rToneFreq",
    "cToneFreq",
    "DtcsCode",
    "DtcsPolarity",
    "RxDtcsCode",
    "CrossMode",
    "Mode",
    "TStep",
    "Skip",
    "Power",
    "Comment",
  ];

  const data = [header];
  for (let i = 0; i < contacts.length; ++i) {
    data.push(await generateCsvRowChirp(contacts[i], i));
  }

  const payload = data
    .map(
      (row) =>
        row
          .map(String) // convert every value to String
          .map((v) => v.replaceAll('"', '""')) // escape double quotes
          .map((v) => `"${v}"`) // quote it
          .join(",") // comma-separated
    )
    .join("\r\n"); // rows starting on new lines

  const blob = new Blob([payload], { type: "text/csv" });
  return blob;
}

export async function generateCsvRowGD77Channel(
  contact: Contact,
  idx: number
): Promise<string[]> {
  // Channel Number,Channel Name,Channel Type,Rx Frequency,Tx Frequency,Bandwidth (kHz),Colour Code,Timeslot,Contact,TG List,DMR ID,TS1_TA_Tx,TS2_TA_Tx ID,RX Tone,TX Tone,Squelch,Power,Rx Only,Zone Skip,All Skip,TOT,VOX,No Beep,No Eco,APRS,Latitude,Longitude

  return [
    (idx + 1).toString(), // 1-based channel indexing
    contact.callsign + " " + contact.location.split(",")[0],
    "Analogue", // TODO: DMR
    contact.frequency!.toString(),
    (contact.frequency! + (contact.offset ?? 0)).toString(),
    "25", // bandwidth
    "", // DMR Colour Code
    "", // DMR timeslot
    "", // DMR Contact
    "", // DMR TG list
    "", // DMR ID
    "", // TS1_TA_Tx
    "", // TS2_TA_Tx ID
    contact.rxToneMode === "CTCSS" ? contact.rxTone!.toString() : "",
    contact.txToneMode === "CTCSS" ? contact.txTone!.toString() : "",
    "Disabled", // Squelch
    "Master", // Power
    "No", // RX Only
    "No", // Zone Skip
    "No", // All Skip
    "0", // TOT
    "No", // VOX
    "No", // No Beep
    "No", // No Eco
    "None", // APRS
    "0", // Latitude
    "0", // Longitude
  ];
}

export async function generateCsvGD77Channels(
  contacts: Contact[]
): Promise<Blob> {
  const header = [
    "Channel Number",
    "Channel Name",
    "Channel Type",
    "Rx Frequency",
    "Tx Frequency",
    "Bandwidth (kHz)",
    "Colour Code",
    "Timeslot",
    "Contact",
    "TG List",
    "DMR ID",
    "TS1_TA_Tx",
    "TS2_TA_Tx ID",
    "RX Tone",
    "TX Tone",
    "Squelch",
    "Power",
    "Rx Only",
    "Zone Skip",
    "All Skip",
    "TOT",
    "VOX",
    "No Beep",
    "No Eco",
    "APRS",
    "Latitude",
    "Longitude",
  ];

  const data = [header];
  for (let i = 0; i < contacts.length; ++i) {
    if (contacts[i].cardType === "repeater") {
      data.push(await generateCsvRowGD77Channel(contacts[i], i));
    }
  }

  const payload = data
    .map(
      (row) =>
        row
          .map(String) // convert every value to String
          .map((v) => v.replaceAll('"', '""')) // escape double quotes
          .map((v) => `"${v}"`) // quote it
          .join(",") // comma-separated
    )
    .join("\r\n"); // rows starting on new lines

  const blob = new Blob([payload], { type: "text/csv" });
  return blob;
}

export async function generateCsvRowGD77Contact(
  contact: Contact
): Promise<string[] | null> {
  // Contact Name,ID,ID Type,TS Override

  const response = await fetch(
    `https://radioid.net/api/dmr/user/?callsign=${contact.callsign}`
  );
  const data = await response.json();

  if (data.results.length < 1) {
    // user does not have a DMR ID
    return null;
  }

  return [
    contact.callsign + " " + contact.name.split(" ")[0],
    data.results[0].id,
    "Private", // TODO: talkgroup support?
    "Disabled",
  ];
}

export async function generateCsvGD77Contacts(
  contacts: Contact[]
): Promise<Blob> {
  const header = ["Contact Name", "ID", "ID Type", "TS Override"];

  const data = [header];
  const rows = await Promise.all(
    contacts
      .filter((c) => c.cardType === "person")
      .map((c) => generateCsvRowGD77Contact(c))
  );

  rows.forEach((row) => {
    if (row) {
      data.push(row);
    }
  });

  const payload = data
    .map(
      (row) =>
        row
          .map(String) // convert every value to String
          .map((v) => v.replaceAll('"', '""')) // escape double quotes
          .map((v) => `"${v}"`) // quote it
          .join(",") // comma-separated
    )
    .join("\r\n"); // rows starting on new lines

  const blob = new Blob([payload], { type: "text/csv" });
  return blob;
}

export async function generateCsvGD77Zip(contacts: Contact[]) {
  const individuals = contacts.filter((c) => c.cardType === "person");
  const repeaters = contacts.filter((c) => c.cardType === "repeater");

  const contactsFile = generateCsvGD77Contacts(individuals);
  const channelsFile = generateCsvGD77Channels(repeaters);

  const zip = new JSZip();

  zip.file("contacts.csv", contactsFile);
  zip.file("channels.csv", channelsFile);

  return await zip.generateAsync({ type: "blob" });
}
