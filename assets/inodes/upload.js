import {
  browserName,
  createSignal,
  flashNow,
  GENERAL_ERR_MSG,
  replaceFragment,
} from "$main";

const btnShowDialog = document.getElementById("show-upload");
const { workerSrc, dirId } = btnShowDialog.dataset;
const EXIT_MSG = "Do you really want to stop the upload?";

const endpoints = {
  initiate: "/inodes/upload/initiate",
  complete: "/inodes/upload/complete",
};

let dialog;
let form;
let btnSubmit;
let fileInput;
let dropOverlay;
let btnClose;
let errorEl;
let worker;
let uploadedItemsCount;

btnShowDialog.disabled = false;
initDragAndDrop();

// =====================
// Events
// =====================

btnShowDialog.onclick = () => {
  if (!dialog) {
    insertDialog();
    initDialogEvents();
  }
  statusSignal.value = "idle";
};

addEventListener("offline", () => {
  onlineSignal.value = false;
});

addEventListener("online", () => {
  onlineSignal.value = true;
});

function onBuyTrafficCheckoutSignal(event) {
  if (event.type === "success") errorSignal.value = null;
}

function onBuyTrafficDialogOpenSignal(flag) {
  dialog.hidden = flag;
}

// =====================
// Dialog Events
// =====================

function initDialogEvents() {
  form.onsubmit = (e) => {
    e.preventDefault();
    statusSignal.value = "started";
  };

  btnClose.onclick = () => {
    if (statusSignal.value !== "started" || confirm(EXIT_MSG)) {
      statusSignal.value = "closed";
    }
  };

  fileInput.onchange = () => {
    errorSignal.value = null;
  };

  dialog.oncancel = (e) => {
    if (e.target !== dialog) return;
    if (statusSignal.value === "idle") {
      statusSignal.value = "closed";
    } else {
      e.preventDefault();
    }
  };
}

// =====================
// Drag & Drop Events
// =====================

function initDragAndDrop(e) {
  document.addEventListener("dragenter", (e) => {
    if (e.dataTransfer.types.includes("Files")) {
      e.preventDefault();
      initDialog();
      dropOverlay.showPopover();
    }
  });

  document.addEventListener("dragover", (e) => {
    e.preventDefault();
  });

  document.addEventListener("dragleave", (e) => {
    e.preventDefault();
    if (e.target === dropOverlay) {
      dropOverlay.hidePopover();
    }
  });

  document.addEventListener("drop", (e) => {
    e.preventDefault();
    addFilesToInput(e.dataTransfer.files);
    dropOverlay.hidePopover();
    statusSignal.value = "idle";
    btnSubmit.focus();
  });
}

// =====================
//  Worker Messages
// =====================

function onWorkerMsg(event) {
  const { type, data } = event.data;
  if (type === "progress") {
    progressSignal.value = data;
  } else if (type === "completed") {
    uploadedItemsCount = data.uploadedItemsCount;
    statusSignal.value = "completed";
  } else if (type === "error") {
    errorSignal.value = data?.message || GENERAL_ERR_MSG;
    if (data?.code === "quota_exceeded") {
      renderBuyTrafficButton();
    }
  }
}

function sendStartUpload() {
  worker = new Worker(workerSrc, { type: "module" });
  worker.onmessage = onWorkerMsg;
  worker.postMessage({
    type: "start",
    data: {
      endpoints,
      files: fileInput.files,
      dirId,
    },
  });
}

// =====================
// Signals
// =====================

const statusSignal = createSignal("closed");
const progressSignal = createSignal(null);
const errorSignal = createSignal("");
const onlineSignal = createSignal(navigator.onLine);

statusSignal.subscribe(async (status) => {
  renderStatusChange();

  if (status === "idle") {
    dialog.showModal();
    progressSignal.value = null;
  } else if (status === "started") {
    sendStartUpload();
    progressSignal.value = { pending: true };
    errorSignal.value = null;
  } else if (status === "completed") {
    await replaceFragment("inodes");
    statusSignal.value = "closed";
    renderSuccessFlash();
  } else if (status === "closed") {
    dialog.close();
    form.reset();
    errorSignal.value = null;
    worker?.postMessage({ type: "close" });
  }
});

progressSignal.subscribe((val) => {
  renderProgress(val);
});

errorSignal.subscribe((msg) => {
  if (msg) statusSignal.value = "idle";
  renderError(msg);
});

onlineSignal.subscribe((isOnline) => {
  if (
    !isOnline &&
    statusSignal.value === "started" &&
    browserName === "Firefox"
  ) {
    errorSignal.value = "The network is offline, try again later";
    worker.postMessage({ type: "abort" });
  }
});

// =====================
// Utils
// =====================

function addFilesToInput(files) {
  const dt = new DataTransfer();
  for (const file of fileInput.files) dt.items.add(file);
  for (const file of files) dt.items.add(file);
  fileInput.files = dt.files;
}

// =====================
// Rendering
// =====================

function insertDialog() {
  document.body.insertAdjacentHTML(
    "beforeend",
    `
      <div popover id="upload-drop-overlay">Drop files here</div>
      <dialog id="upload-dialog">
        <h1>Upload</h1> 
        <p id="upload-dialog-error" class="alert error" hidden></p>
        <form class="basic">
          <input type="file" multiple required />
          <footer>
            <button type="button" class="close">Cancel</button>
            <button class="submit"></button>
          </footer>
        </form>
      </dialog>
    `
  );
  dialog = document.getElementById("upload-dialog");
  form = dialog.querySelector("form");
  fileInput = form.querySelector("input[type=file]");
  dropOverlay = document.getElementById("upload-drop-overlay");
  btnSubmit = form.querySelector("button.submit");
  btnClose = form.querySelector("button.close");
  errorEl = document.getElementById("upload-dialog-error");
}

function renderStatusChange() {
  const isRunning = ["started", "completed"].includes(statusSignal.value);
  fileInput.disabled = isRunning;
  btnSubmit.disabled = isRunning;
  btnSubmit.textContent = isRunning ? "Uploading" : "Start Upload";
  btnSubmit.classList.toggle("spinner", isRunning);
}

function renderProgress(state) {
  const el = document.getElementById("upload-progress");
  if (!state) {
    el?.remove();
    return;
  }
  if (!el) {
    form.querySelector("footer").insertAdjacentHTML(
      "beforebegin",
      `<label id="upload-progress">
        <progress id="upload-progress-bar" value="0" max="100"></progress>
        <span class="info" id="upload-progress-info"></span>
      </label>`
    );
  }
  const { perc = 0, pending } = state;
  const progressBar = document.getElementById("upload-progress-bar");
  const infoEl = document.getElementById("upload-progress-info");

  progressBar.value = perc;

  infoEl.innerText =
    perc === 100 ? "Finalizing…" : pending ? "Pending…" : `${perc} %`;
}

async function renderBuyTrafficButton() {
  const template = document.getElementById("button-buy-traffic-template");
  const buttonOpen = template.content.querySelector("button").cloneNode(true);
  errorEl.append(buttonOpen);
  const buyMod = await import(template.dataset.script);
  buyMod.initButtonOpen();
  buyMod.initDialog();
  buyMod.checkoutSignal.subscribe(onBuyTrafficCheckoutSignal);
  buyMod.dialogOpenSignal.subscribe(onBuyTrafficDialogOpenSignal);
}

function renderSuccessFlash() {
  const filesWord = `file${uploadedItemsCount > 1 ? "s" : ""}`;
  flashNow(`${uploadedItemsCount} ${filesWord} uploaded`);
}

function renderError(msg) {
  errorEl.hidden = !msg;
  errorEl.textContent = msg;
}
