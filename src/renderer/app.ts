const startBtn = document.querySelector("#startBtn") as HTMLButtonElement;
const saveLoginBtn = document.querySelector("#saveLoginBtn") as HTMLButtonElement;
const selectFileBtn = document.querySelector("#selectFileBtn") as HTMLButtonElement;
const logsData = document.querySelector("#logsData") as HTMLElement;

let selectedFile: string | null = null;

function appendLog(msg: string) {
    const p = document.createElement("p");
    p.textContent = msg;
    logsData.appendChild(p);

    logsData.scrollTop = logsData.scrollHeight;
};

selectFileBtn.addEventListener("click", async () => {
    const filePath = await (window as any).electronAPI.pickFile();
    if (filePath) {
        selectedFile = filePath;
        document.getElementById("selectedFile")!.textContent = `${filePath}`;
        startBtn.disabled = false;
    } else {
        document.getElementById("selectedFile")!.textContent = "❌ No file selected";
        startBtn.disabled = true;
    }
});

saveLoginBtn.addEventListener("click", async () => {
    logsData.innerHTML = "";
    appendLog("⚡ Running save login...");
    const result = await (window as any).electronAPI.runSaveLoginScript();
    appendLog(result);
});

startBtn.addEventListener("click", async () => {
    if (!selectedFile) {
        appendLog("❌ Please select a file first!");
        return;
    }
    logsData.innerHTML = "";
    appendLog("🚀 Starting automation...");
    const result = await (window as any).electronAPI.startAutomation(selectedFile);
    appendLog(result.success ? `${result.message} ✅ File saved at: ${result.doneFile}` : result.message);
});

(window as any).electronAPI.onAutomationLog((msg: string) => {
    appendLog(msg);
});

(window as any).electronAPI.onSaveLoginLog((msg: string) => {
    appendLog(msg);
});