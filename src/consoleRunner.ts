import {select} from "@inquirer/prompts";
import readline from "readline";
import {DirectoryManager, IDirectoryManager} from "./directoryManager";

enum Action {
    LIST = 'LIST',
    CREATE = 'CREATE',
    MOVE = 'MOVE',
    DELETE = 'DELETE',
    EXIT = 'EXIT'
}

export class ConsoleRunner {
    public isRunning: boolean = false;

    private rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    private directoryManager: IDirectoryManager;

    constructor(directoryManager: IDirectoryManager) {
        this.directoryManager = directoryManager;

        console.log("\n");
        console.log("-----------------------------------------------------------------------");
        console.info("Welcome to the Directory Explorer!");
        console.info("Please follow the steps outlined to explore and modify directories.");
        console.log("-----------------------------------------------------------------------");

        this.isRunning = true;
        this.promptUser();
    }

    public run(): void {
        this.isRunning = true;
    }

    public promptUser(): void {
        console.info("The Directory Explorer allows you to list, create, move, and delete directories.");
        console.info("To list all directories, type \"LIST\"");
        console.info("To create a new directory, type \"CREATE\" followed by the name of the new directory. You may use \"/\" to create nested directories. Ex. \"CREATE my/nested/directory\"");
        console.info("To move a directory, type \"MOVE\" followed by the name of the directory you wish to move and then the new location. You may use \"/\" move a directory nested inside of another. Ex. \"MOVE my/nested/directory my/new/location\"");
        console.info("To delete a directory, type \"DELETE\" followed by the name of the directory you wish to delete. You may use \"/\" to delete a directory nested inside of another. Ex. \"DELETE my/nested/directory\"");
        console.info("To exit the application, type \"EXIT\".");
        console.log("\n");

        this.rl.question('What action would you like to take?', (answer) => {
            try {
                const parameters = answer.split(' ');
                const action = parameters[0].toUpperCase();

                parameters.shift();

                switch (action) {
                    case Action.LIST:
                        const listOfDirectories = this.directoryManager.listDirectories();
                        console.log("");
                        console.log("/////////// LIST OF DIRECTORIES ///////////////////");
                        console.log(listOfDirectories);
                        break;
                    case Action.CREATE:
                        this.directoryManager.createDirectories(parameters[0]);
                        break;
                    case Action.MOVE:
                        this.directoryManager.moveDirectories(parameters[0], parameters[1]);
                        break;
                    case Action.DELETE:
                        this.directoryManager.deleteDirectories(parameters[0]);
                        break;
                    case Action.EXIT:
                        this.isRunning = false;
                        this.rl.close();
                        break;
                    default:
                        console.log("Invalid action requested. Valid actions are LIST, CREATE, DELETE, MOVE, and EXIT. Please try again.\n");
                }

                console.log("\n");

                if (this.isRunning) {
                    this.promptUser();
                }
            }
            catch (e: unknown) {
                const error = e as Error;
                console.log("\n");
                console.log("/////////////////////////////////////////////");
                console.error(error.message);
                console.log("/////////////////////////////////////////////");
                console.log("\n");

                if (this.isRunning) {
                    this.promptUser();
                }
            }
        });
    }
}