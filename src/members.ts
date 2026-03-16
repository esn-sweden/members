import Personnummer from 'personnummer';
import * as XLSX from "xlsx";

export function countMembers() {
  const input = document.querySelector<HTMLTextAreaElement>("#pnInput")!;
  const totalEl = document.querySelector<HTMLSpanElement>("#totalCount")!;
  const womenEl = document.querySelector<HTMLSpanElement>("#womenCount")!;
  const menEl = document.querySelector<HTMLSpanElement>("#menCount")!;
  const under26El = document.querySelector<HTMLSpanElement>("#under26Count")!;
  const invalidEl = document.querySelector<HTMLSpanElement>("#invalidCount")!;
  const invalidContainer = document.querySelector<HTMLDivElement>("#invalidContainer")!;
  const invalidList = document.querySelector<HTMLUListElement>("#invalidList")!;
  const fileInput = document.querySelector<HTMLInputElement>("#fileInput")!;

  input.addEventListener("input", () => {
    const pns = input.value
      .split(/\r?\n/)
      .map(l => l.trim())
      .filter(l => l.length > 0);
    updateStats(pns);
  });

  fileInput.addEventListener("change", handleFileAsync);

  async function handleFileAsync(e: Event) {
    const input = e.target as HTMLInputElement
    const file = input.files?.[0];
    if (!file) return;

    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    const range = XLSX.utils.decode_range(sheet['!ref']!);
    range.s.r = 5 // there are 5 rows before the headers
    sheet['!ref'] = XLSX.utils.encode_range(range);
    const rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: "" }).slice(5);
    console.log(rows);
    if (rows.length === 0 || !("Personnummer" in (rows[0]))) {
      window.alert("Column Personnummer not found")
    }

    const pns = rows.map(r => r["Personnummer"]).filter(Boolean);
    updateStats(pns);
  }


  function updateStats(lines: string[]) {
    let total = 0;
    let women = 0;
    let men = 0;
    let under26 = 0;
    let invalid = 0;
    let invalidPn: string[] = [];

    for (const line of lines) {
      // Personnummer does not work for temporary identifiers with letters e.g. T or R by default
      const normPn = line.replace(/[A-Za-z]/, "1");

      if (!Personnummer.valid(normPn)) {
        invalid++;
        invalidPn.push(line);
        continue;
      }

      total++;

      const pn = Personnummer.parse(normPn);
      if (pn.isFemale()) women++;
      if (pn.isMale()) men++;
      if (pn.getAge() < 26) under26++;

    }

    totalEl.textContent = String(total);
    womenEl.textContent = String(women);
    menEl.textContent = String(men);
    under26El.textContent = String(under26);
    invalidEl.textContent = String(invalid);


    invalidList.innerHTML = "";
    for (const num of invalidPn) {
      const li = document.createElement("li");
      li.textContent = num;
      invalidList.appendChild(li);
    }

    invalidContainer.classList.toggle("d-none", invalidPn.length === 0);
  }
}
