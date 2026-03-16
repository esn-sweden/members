import './styles.scss'
import Personnummer from 'personnummer';
import * as XLSX from "xlsx";

type Person = {
    pn: string;
    name: string;
}

// input
const textInput = document.querySelector<HTMLTextAreaElement>("#pnInput")!;
const fileInput = document.querySelector<HTMLInputElement>("#fileInput")!;

// stats
const totalEl = document.querySelector<HTMLSpanElement>("#totalCount")!;
const womenEl = document.querySelector<HTMLSpanElement>("#womenCount")!;
const menEl = document.querySelector<HTMLSpanElement>("#menCount")!;
const under26El = document.querySelector<HTMLSpanElement>("#under26Count")!;
const invalidEl = document.querySelector<HTMLSpanElement>("#invalidCount")!;

// invalid numbers
const invalidContainer = document.querySelector<HTMLDivElement>("#invalidContainer")!;
const invalidList = document.querySelector<HTMLUListElement>("#invalidList")!;


textInput.addEventListener("input", handleTextInput);
fileInput.addEventListener("change", handleFileAsync);

function handleTextInput() {
    const persons: Person[] = textInput.value
        .split(/\r?\n/)
        .map(l => l.trim())
        .filter(l => l.length > 0).map(pn => ({ pn, name: "" }));

    fileInput.value = ""; // clear file input
    fileInput.classList.remove("is-invalid");
    updateStats(persons);
}

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
    if (rows.length === 0 || !("Personnummer" in (rows[0]))) {
        fileInput.classList.add("is-invalid");
    } else {
        fileInput.classList.remove("is-invalid");
    }

    const persons: Person[] = rows.map(r => ({
        pn: r["Personnummer"],
        name: `${(r["Förnamn"]) ?? ""} ${(r["Efternamn"]) ?? ""}`.trim()
    }));

    textInput.value = "" // clear textbox input
    updateStats(persons);
}


function updateStats(persons: Person[]) {
    let total = 0;
    let women = 0;
    let men = 0;
    let under26 = 0;
    let invalid = 0;
    let invalidPn: string[] = [];

    for (const person of persons) {
        // Personnummer does not work for temporary identifiers with letters e.g. T or R by default
        const normPn = person.pn.replace(/[A-Za-z]/, "1");

        if (!Personnummer.valid(normPn)) {
            invalid++;
            invalidPn.push(`${person.pn}${person.name ? ` (${person.name})` : ""}`);
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

    invalidList.innerHTML = invalidPn.map(num => `<li>${num}</li>`).join("");
    invalidContainer.classList.toggle("d-none", invalidPn.length === 0);
}
