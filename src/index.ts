import {ConsoleRunner} from "./consoleRunner.js";
import {DirectoryManager} from "./directoryManager";

async function main() {
    const directoryManager = new DirectoryManager();
    const consoleRunner = new ConsoleRunner(directoryManager);

    consoleRunner.run();
}

await main();