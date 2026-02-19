import Personnummer from 'personnummer';

export function countMembers(app: HTMLElement) {
  app.innerHTML = `
<div class="mb-3">
  <label for="pnInput" class="form-label">
    Paste your members' personal identity numbers (personnummer) below:
  </label>
  <textarea id="pnInput" class="form-control mb-3" rows="6" placeholder="One personal number per line">
</textarea>

  <div class="card bg-light border-0 mb-3">
    <div class="card-body p-3">

      <div class="d-flex justify-content-between py-2 border-bottom">
        <span>Total members</span>
        <strong id="totalCount">0</strong>
      </div>

      <div class="d-flex justify-content-between py-2 border-bottom">
        <span>Men</span>
        <strong id="menCount">0</strong>
      </div>

      <div class="d-flex justify-content-between py-2 border-bottom">
        <span>Women</span>
        <strong id="womenCount">0</strong>
      </div>

      <div class="d-flex justify-content-between py-2 border-bottom">
        <span>Under 26</span>
        <strong id="under26Count">0</strong>
      </div>

      <div class="d-flex justify-content-between py-2">
        <span>Invalid personal identity numbers</span>
        <strong id="invalidCount">0</strong>
      </div>

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
  const menEl = app.querySelector<HTMLSpanElement>("#menCount")!;
  const womenEl = app.querySelector<HTMLSpanElement>("#womenCount")!;
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
    let men = 0;
    let women = 0;
    let under26 = 0;
    let invalid = 0;
    let invalidPn: string[] = [];

    for (const line of lines) {
      // Personnummer does not work for temporary number with letters e.g. T or R by default
      const normPn = line.replace(/[A-Za-z]/, "1");

      if (!Personnummer.valid(normPn)) {
        invalid++;
        invalidPn.push(line);
        continue;
      }

      total++;

      const pn = Personnummer.parse(normPn);
      if (pn.isMale()) men++;
      if (pn.isFemale()) women++;
      if (pn.getAge() < 26) under26++;

    }

    totalEl.textContent = String(total);
    menEl.textContent = String(men);
    womenEl.textContent = String(women);
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
