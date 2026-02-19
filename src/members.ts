import Personnummer from 'personnummer';

export function countMembers(app: HTMLElement) {
  app.innerHTML = `
<div class="mb-3">
  <label for="pnInput" class="form-label">
    Paste your members' personal identity numbers (personnummer) below:
  </label>
  <textarea id="pnInput" class="form-control mb-3" rows="6" placeholder="One personal number per line">
</textarea>

  <div class="d-flex flex-wrap gap-3">
    <div class="card text-center p-3 flex-fill bg-light border-0" style="min-width: 150px;">
      <div class="h6">Total members</div>
      <div class="h2" id="totalCount">0</div>
    </div>

    <div class="card text-center p-3 flex-fill bg-light border-0" style="min-width: 150px;">
      <div class="h6">Women</div>
      <div class="h2" id="womenCount">0</div>
    </div>

    <div class="card text-center p-3 flex-fill bg-light border-0" style="min-width: 150px;">
      <div class="h6">Men</div>
      <div class="h2" id="menCount">0</div>
    </div>

    <div class="card text-center p-3 flex-fill bg-light border-0" style="min-width: 150px;">
      <div class="h6">Under 26</div>
      <div class="h2" id="under26Count">0</div>
    </div>

    <div class="card text-center p-3 flex-fill bg-light border-0" style="min-width: 150px;">
      <div class="h6">Invalid personal identity numbers</div>
      <div class="h2" id="invalidCount">0</div>
    </div>
  </div>

  <div id="invalidContainer" class="card alert alert-danger border-0 mt-3 d-none">
    <div class="card-body">
      <h6 class="text-danger fw-semibold mb-3">
        Invalid personal identity numbers
      </h6>
      <ul id="invalidList"></ul>
    </div>
  </div>
</div>
  `;

  const input = app.querySelector<HTMLTextAreaElement>("#pnInput")!;
  const totalEl = app.querySelector<HTMLSpanElement>("#totalCount")!;
  const womenEl = app.querySelector<HTMLSpanElement>("#womenCount")!;
  const menEl = app.querySelector<HTMLSpanElement>("#menCount")!;
  const under26El = app.querySelector<HTMLSpanElement>("#under26Count")!;
  const invalidEl = app.querySelector<HTMLSpanElement>("#invalidCount")!;
  const invalidContainer = app.querySelector<HTMLDivElement>("#invalidContainer")!;
  const invalidList = app.querySelector<HTMLUListElement>("#invalidList")!;

  input.addEventListener("input", () => {
    const lines = input.value
      .split(/\r?\n/)
      .map(l => l.trim())
      .filter(l => l.length > 0);

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
  });
}
