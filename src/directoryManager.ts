interface Directory {
    name: string;
    children: Directory[];
}

export interface IDirectoryManager {
    listDirectories(): string;
    createDirectories(path: string): void;
    deleteDirectories(path: string): void;
    moveDirectories(folderPathToMove: string, folderPathDestination: string): void;
}

export class DirectoryManager implements IDirectoryManager {
    private directories: Directory[] = [];

    constructor() {}

    public listDirectories(): string {
        return this.buildListDirectoryOutput("", 0, this.directories);
    }

    public createDirectories(path: string) {
        if (!path || path === '') {
            throw new Error('Invalid directory path provided. You must supply a directory name or a path to a directory to be created.');
        }

        const segments = path.split('/');

        this.directories = this.createDirectoriesRecursively(segments, 0, this.directories);
    }

    public deleteDirectories(path: string): void {
        if (!path || path === '') {
            throw new Error('Invalid directory path provided. You must supply a directory name or a path to be deleted.');
        }

        const segments = path.split('/');

        this.directories = this.deleteDirectoriesRecursively(segments, 0, this.directories);
    }

    public moveDirectories(folderPathToMove: string, folderPathDestination: string): void {
        if (!folderPathToMove || !folderPathDestination) {
            throw new Error('Invalid directory path provided. You must supply a both the source directory and the destination directory.');
        }

        const sourcePathSegments = folderPathToMove.split('/');
        const destinationPathSegments = folderPathDestination.split('/');

        // find the existing folder
        const directoryToMove = this.findDirectoryByPathSegments(sourcePathSegments, 0, this.directories);

        // place the existing folder in the new location
        this.directories = this.placeDirectoryAtLocation(directoryToMove, destinationPathSegments, 0, this.directories);

        try {
            // remove that folder from previous position
            this.directories = this.deleteDirectoriesRecursively(sourcePathSegments, 0, this.directories);
        }
        catch (e: unknown) {
            const error = e as Error;

            // remove directory from folder it was moved to if it failed to delete
            destinationPathSegments.push(directoryToMove.name);

            this.directories = this.deleteDirectoriesRecursively(destinationPathSegments, 0, this.directories);

            throw new Error(error.message);
        }
    }

    private findDirectoryByPathSegments(pathSegments: string[], currentLevel: number, directories: Directory[]): Directory {
        const directoryAtLevel = directories.find((directory) => directory.name === pathSegments[currentLevel]);

        if (!directoryAtLevel) {
            throw new Error(`Could not move ${pathSegments.join('/')}. Directory ${pathSegments[currentLevel]} does not exist.`);
        }

        if (currentLevel < pathSegments.length - 1) {
            return this.findDirectoryByPathSegments(pathSegments, currentLevel + 1, directoryAtLevel.children);
        }

        return directoryAtLevel;
    }

    private buildListDirectoryOutput(currentListOutput: string, currentLevel: number, directories: Directory[]): string {
        let copyOfOutput = currentListOutput;

        directories.sort((a, b) => a.name.localeCompare(b.name));

        directories.forEach(directory => {
            for(let i = 0; i < currentLevel; i++) {
                copyOfOutput += "--";
            }

            copyOfOutput += directory.name + "\n";

            if (directory.children.length > 0) {
                copyOfOutput = this.buildListDirectoryOutput(copyOfOutput, currentLevel + 1, directory.children);
            }
        });

        return copyOfOutput;
    }

    private createDirectoriesRecursively(pathSegments: string[], currentLevel: number, directories: Directory[]): Directory[] {
        let foundExistingDirectory = false;

        directories.forEach((directory) => {
            if (directory.name === pathSegments[currentLevel]) {
                foundExistingDirectory = true;

                if (pathSegments[currentLevel + 1]) {
                    directory.children = this.createDirectoriesRecursively(pathSegments, currentLevel + 1, directory.children);
                }
                else {
                    throw new Error(`Directory ${pathSegments[currentLevel]} already exists.`);
                }
            }
        })

        if (!foundExistingDirectory) {
            return [
                ...directories,
                {
                    name: pathSegments[currentLevel],
                    children: pathSegments[currentLevel + 1] ? this.createDirectoriesRecursively(pathSegments, currentLevel + 1, []) : [],
                }
            ];
        }

        return directories;
    }

    private deleteDirectoriesRecursively(pathSegments: string[], currentLevel: number, directories: Directory[]): Directory[] {
        let foundExistingDirectory = false;

        let indexOfDirectoryToRemove = -1;

        directories.forEach((directory, index) => {
            if (directory.name === pathSegments[currentLevel]) {
                foundExistingDirectory = true;

                // if the current level is the same as the last item in pathSegments, set the index to remove
                if (currentLevel === pathSegments.length - 1) {
                    indexOfDirectoryToRemove = index;
                }
                // if there are more levels to traverse, recursively call
                else if (pathSegments[currentLevel + 1]) {
                    directory.children = this.deleteDirectoriesRecursively(pathSegments, currentLevel + 1, directory.children);
                }
            }
        })

        if (foundExistingDirectory && indexOfDirectoryToRemove !== -1) {
            directories.splice(indexOfDirectoryToRemove, 1);
        }

        if (!foundExistingDirectory) {
            throw new Error(`Cannot delete ${ pathSegments.join('/') } - ${pathSegments[currentLevel]} does not exist`);
        }

        return directories;
    }

    private placeDirectoryAtLocation(newDirectory: Directory, destinationSegments: string[], currentLevel: number, directories: Directory[]): Directory[] {
        let foundExistingDirectory = false;

        directories.forEach((directory) => {
            if (directory.name === destinationSegments[currentLevel]) {
                foundExistingDirectory = true;

                // if you are at the destination folder, add the new directory there
                if (currentLevel === destinationSegments.length - 1) {
                    // if the destination folder does not already have a folder with that name
                    if (!directory.children.find((directory) => directory.name === destinationSegments[currentLevel + 1])) {
                        directory.children.push(newDirectory);
                    }
                    // otherwise throw an error
                    else {
                        throw new Error(`Could not move directory to ${destinationSegments.join('/')}. Directory ${destinationSegments[currentLevel + 1]} already exists.`);
                    }
                }
                // if there is another segment to parse, go to the next level
                if (destinationSegments[currentLevel + 1]) {
                    directory.children = this.placeDirectoryAtLocation(newDirectory, destinationSegments, currentLevel + 1, directory.children);
                }
            }
        })

        if (!foundExistingDirectory) {
            throw new Error(`Could not move directory to ${destinationSegments.join('/')}. ${destinationSegments[currentLevel]} does not exist`);
        }

        return directories;
    }
}