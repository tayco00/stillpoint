import { writeFile } from "node:fs/promises";
import axe from "axe-core";
import { Builder } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome.js";

const chromePath = process.env.AXE_CHROME_PATH;
const driverPath = process.env.AXE_CHROMEDRIVER_PATH;
const url = process.argv[2] ?? "http://localhost:3001";
const output = process.argv[3] ?? "docs/axe-results.json";

if (!chromePath || !driverPath) {
  throw new Error("Set AXE_CHROME_PATH and AXE_CHROMEDRIVER_PATH to matching binaries.");
}

const options = new chrome.Options()
  .setChromeBinaryPath(chromePath)
  .addArguments("--headless=new", "--no-sandbox", "--disable-gpu");
const service = new chrome.ServiceBuilder(driverPath);
const driver = await new Builder()
  .forBrowser("chrome")
  .setChromeOptions(options)
  .setChromeService(service)
  .build();

try {
  await driver.get(url);
  await driver.sleep(900);
  await driver.executeScript(axe.source);
  const results = await driver.executeAsyncScript(`
    const done = arguments[arguments.length - 1];
    axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"] } })
      .then(done)
      .catch((error) => done({ error: error.message }));
  `);
  if (results.error) throw new Error(results.error);
  await writeFile(output, `${JSON.stringify(results, null, 2)}\n`, "utf8");

  const blocking = results.violations.filter((item) =>
    ["critical", "serious"].includes(item.impact),
  );
  const uncertain = results.incomplete.filter((item) =>
    ["critical", "serious"].includes(item.impact),
  );
  console.log(
    `Axe: ${results.violations.length} violations, ${blocking.length} critical/serious violations, ${uncertain.length} critical/serious manual checks.`,
  );
  if (blocking.length > 0) process.exitCode = 1;
} finally {
  await driver.quit();
}
