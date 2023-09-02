const style = {
  lineNumbers: true,
  styleSelectedText: true,
  showTrailingSpace: true,
  styleActiveLine: true,
  lineWrapping: true,
  scrollbarStyle: "overlay",
};

const l = document.getElementById("logs");
let c = CodeMirror.fromTextArea(config, style);
let r = CodeMirror.fromTextArea(request, style);
r.setSize("49%");

async function bake(e) {
  const cfg = c.getValue();
  const req = r.getValue();
  const data = { config: cfg, request: req };
  const endpoint = "/api/play";
  const headers = { "Content-Type": "application/json" };

  e.disabled = true;

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(data),
    });

    const r = await res.json();

    if (!r.ok) {
      l.classList.add("err-bg");
    } else {
      l.classList.remove("err-bg");
    }

    l.innerHTML += JSON.stringify(r) + "\n";
  } catch (e) {
    console.error(e);
  }

  e.disabled = false;
}

function clearLogs() {
  l.innerHTML = "";
  l.classList.remove("err-bg");
}