const style = {
  lineNumbers: true,
  styleSelectedText: true,
  showTrailingSpace: true,
  styleActiveLine: true,
  lineWrapping: true,
  scrollbarStyle: "overlay",
};

const config = document.getElementById("config");
const request = document.getElementById("request");

const playBtn = document.getElementById("play");
const clearBtn = document.getElementById("clear");
const resetBtn = document.getElementById("reset");

const cm = document.getElementsByClassName("CodeMirror");
const note = document.getElementById("note");

const l = document.getElementById("logs");
let c = CodeMirror.fromTextArea(config, style);
let r = CodeMirror.fromTextArea(request, style);
r.setSize("49%");

introJs().setOptions({
  dontShowAgain: true,
  disableInteraction: true,
  showProgress: true,
  showBullets: false,
  steps: [{
    title: 'Hello! 👋',
    intro: 'This web allows you to experiment with your configuration...'
  },
  {
    title: 'Hello! 👋',
    intro: '...and simulate requests tailored to meet the unique requirements of your app.'
  },
  {
    title: 'Configuration',
    element: cm[0],
    intro: 'Feel free to customize the config here as per your preferences!'
  },
  {
    title: 'Request simulation',
    element: cm[1],
    intro: 'Also, perform a test of the config by simulating the request you intend to send here.'
  },
  {
    title: 'Play!',
    element: playBtn,
    intro: 'Then, click this to execute your request using the configured teler WAF settings.'
  },
  {
    title: 'Response',
    element: l,
    intro: 'Once completed, you can view the results here.'
  },
  {
    title: 'Notes',
    element: note,
    intro: 'Please consult this note to discover the response details.'
  },
  {
    title: 'Clear logs',
    element: clearBtn,
    intro: 'To clean up the logs, simply press this button.'
  },
  {
    title: 'Reset',
    element: resetBtn,
    intro: 'If needed, you can reset both the config and request values to their original state.'
  },
  {
    title: 'That\'s it!',
    element: document.querySelector('.card__image'),
    intro: 'You\'re all set to go.'
  }]
}).start();

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

function updateLogScroll() {
  l.scrollTop = l.scrollHeight;
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

  updateLogScroll();
  e.disabled = false;
}

function clearLogs() {
  l.innerHTML = "";
  l.classList.remove("err-bg");
}

function reset() {
  c.setValue(config.value)
  r.setValue(request.value)
}

document.addEventListener('keydown', (e) => {
  const keyToBtn = { 'p': playBtn, 'c': clearBtn, 'r': resetBtn };

  if (e.ctrlKey) {
    const button = keyToBtn[e.key.toLowerCase()];
    if (button) {
      e.preventDefault();
      button.click();
    }
  }
});
