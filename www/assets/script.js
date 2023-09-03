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

function prePlay() {
  const firstLine = r.getRange({line: 0, ch: 0}, {line: 1, ch: 0})
  const lastLine = r.getRange({line: r.lastLine(), ch: 0}, {line: r.lastLine()+1, ch: 0})
  const cl = lastLine.length
  const clPattern = /content-length:\s*(\S+)/i;
  const clHeader = `Content-Length: ${cl}`

  let rVal = r.getValue()
  if (firstLine.startsWith("POST")) {
    if (clPattern.test(rVal)) {
      rVal = rVal.replace(clPattern, (match, oldValue) => {
        return clHeader
      })
      r.setValue(rVal)
    } else {
      if (r.getRange({line: r.lastLine()-1, ch: 0}, {line: r.lastLine(), ch: 0}) !== "\n") return;
      r.replaceRange(`${clHeader}\n\n`,
        {line: r.lastLine()-1, ch: 0}, {line: r.lastLine(), ch: 0}
      )
    }

    return
  }

  if (firstLine.startsWith("GET")) {
    const lastVal = r.getRange({line: r.lastLine()-1, ch: 0}, {line: r.lastLine(), ch: 0});
    if (lastVal !== "\n") r.setValue(`${rVal}\n\n`)
  }
}

async function bake(e) {
  prePlay();

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