import { chromium } from "playwright";

export default async function saveLogin(log: (msg: string) => void) {
    const browser = await chromium.launch({ headless: false, args: ["--start-maximized"], });
    const context = await browser.newContext({ viewport: null });
    const page = await context.newPage();

    await page.goto("https://www.nikshay.in/Dashboard/Diagnostics/");

    console.log("Login manually, Close the browser after logging in.");
    log("⚠ Login manually, Close the browser after logging in.");

    // When the page is closed, save storage state
    page.on("close", async () => {
        try {
            await context.storageState({ path: "auth.json" });
            console.log("Auth saved to auth.json");
            log("✅ Auth saved to auth.json");
        } catch (err) {
            console.error("Failed to save auth:", err);
            log("❌ Failed to save auth!!!");
        } finally {
            await browser.close();
        }
    });
};