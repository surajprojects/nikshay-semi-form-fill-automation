import { app, BrowserWindow, ipcMain, dialog } from "electron";
import * as path from "path";
import run from "../scripts/script";
import saveLogin from "../scripts/saveLogin";
import * as url from "url";  // <-- add this

let mainWindow: BrowserWindow | null = null;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 600,
        height: 900,
        resizable: false,
        fullscreenable: false,
        icon: path.join(__dirname, '..', '..', 'assets', 'icon.ico'),
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            devTools: false,
        },
        autoHideMenuBar: true,
    });

    if (app.isPackaged) {
        // when packaged, load from build folder
        mainWindow.loadURL(
            url.format({
                pathname: path.join(__dirname, "../renderer/index.html"),
                protocol: "file:",
                slashes: true,
            })
        );
    } else {
        // in dev mode, load localhost (Vite/React/Next server) if you use one
        mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
        // or: mainWindow.loadURL("http://localhost:3000")
    }

    mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));

    mainWindow.on("closed", () => {
        mainWindow = null;
    });
    // Prevent zoom
    mainWindow.webContents.setZoomFactor(1);
    mainWindow.webContents.setVisualZoomLevelLimits(1, 1);
    // Disable right-click context menu
    mainWindow.webContents.on("context-menu", (e) => e.preventDefault());
    // prevent keyboard shortcuts
    mainWindow.webContents.on("before-input-event", (event, input) => {
        // block F12
        if (input.key === "F12") {
            event.preventDefault();
        }
        // block Ctrl+Shift+I and Ctrl+R
        const modifiers = input.modifiers; // array of active modifiers
        // Ctrl+Shift+I
        if (input.key.toUpperCase() === "I" && modifiers.includes("Control") && modifiers.includes("Shift")) {
            event.preventDefault();
        }
        // Ctrl+R
        if (input.key.toUpperCase() === "R" && modifiers.includes("Control")) {
            event.preventDefault();
        }
    });
}

app.whenReady().then(() => {
    createWindow();

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

// Global logs pipe
function logToRenderer(channel: string, msg: string) {
    if (mainWindow) {
        mainWindow.webContents.send(channel, msg);
    }
}

// --- File Picker IPC ---
ipcMain.handle("pick-file", async () => {
    if (!mainWindow) return null;

    const result = await dialog.showOpenDialog(mainWindow, {
        properties: ["openFile"],
        filters: [{ name: "Text Files", extensions: ["txt"] }],
    });

    if (result.canceled) return null;
    return result.filePaths[0]; // send file path back to renderer
});

// --- Start Automation IPC ---
ipcMain.handle("start-automation", async (event, filePath: string) => {
    try {
        if (!filePath) throw new Error("No file selected!");

        const dir = path.dirname(filePath);
        const doneFile = path.join(dir, "ids_done.txt");

        await run(filePath, doneFile, (msg: string) => logToRenderer("automation-log", msg));

        return { success: true, message: "✅ Automation finished", doneFile };
    } catch (err: any) {
        return { success: false, message: "Error: " + err.message };
    }
});

// --- Start Save Login IPC ---
ipcMain.handle("run-saveLogin-script", async () => {
    try {
        const result = await saveLogin((msg: string) => logToRenderer("saveLogin-log", msg));
        return result;
    } catch (err) {
        return `Error: ${err}`;
    }
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});