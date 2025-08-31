import { contextBridge, ipcRenderer, shell } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
    pickFile: () => ipcRenderer.invoke("pick-file"),
    startAutomation: (filePath: string) => ipcRenderer.invoke("start-automation", filePath),
    runSaveLoginScript: () => ipcRenderer.invoke("run-saveLogin-script"),
    onAutomationLog: (callback: (msg: string) => void) => {
        ipcRenderer.on("automation-log", (_event, msg: string) => callback(msg));
    },
    onSaveLoginLog: (callback: (msg: string) => void) => {
        ipcRenderer.on("saveLogin-log", (_event, msg: string) => callback(msg));
    },
    openLink: (url: string) => shell.openExternal(url)
});
