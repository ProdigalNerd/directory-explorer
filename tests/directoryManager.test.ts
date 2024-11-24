import { DirectoryManager } from '../src/directoryManager';

describe('DirectoryManager', () => {
    let directoryManager: DirectoryManager;

    beforeEach(() => {
        directoryManager = new DirectoryManager();
    });

    describe('listDirectories', () => {
        it('should return an empty string when there are no directories', () => {
            expect(directoryManager.listDirectories()).toBe('');
        });

        it('should return a list of directories', () => {
            directoryManager.createDirectories('dir1');
            directoryManager.createDirectories('dir2');
            expect(directoryManager.listDirectories()).toBe('dir1\ndir2\n');
        });
    });

    describe('createDirectories', () => {
        it('should create a directory', () => {
            directoryManager.createDirectories('dir1');
            expect(directoryManager.listDirectories()).toBe('dir1\n');
        });

        it('should create nested directories', () => {
            directoryManager.createDirectories('dir1/dir2');
            expect(directoryManager.listDirectories()).toBe('dir1\n--dir2\n');
        });

        it('should throw an error if the directory already exists', () => {
            directoryManager.createDirectories('dir1');
            expect(() => directoryManager.createDirectories('dir1')).toThrow('Directory dir1 already exists.');
        });

        it('should throw an error if the path is invalid', () => {
            expect(() => directoryManager.createDirectories('')).toThrow('Invalid directory path provided. You must supply a directory name or a path to a directory to be created.');
        });
    });

    describe('deleteDirectories', () => {
        it('should delete a directory', () => {
            directoryManager.createDirectories('dir1');
            directoryManager.deleteDirectories('dir1');
            expect(directoryManager.listDirectories()).toBe('');
        });

        it('should delete nested directories', () => {
            directoryManager.createDirectories('dir1/dir2');
            directoryManager.deleteDirectories('dir1/dir2');
            expect(directoryManager.listDirectories()).toBe('dir1\n');
        });

        it('should throw an error if the directory does not exist', () => {
            expect(() => directoryManager.deleteDirectories('dir1')).toThrow('Cannot delete dir1 - dir1 does not exist');
        });

        it('should throw an error if the path is invalid', () => {
            expect(() => directoryManager.deleteDirectories('')).toThrow('Invalid directory path provided. You must supply a directory name or a path to be deleted.');
        });
    });

    describe('moveDirectories', () => {
        it('should move a directory', () => {
            directoryManager.createDirectories('dir1');
            directoryManager.createDirectories('dir2');
            directoryManager.moveDirectories('dir1', 'dir2');
            expect(directoryManager.listDirectories()).toBe('dir2\n--dir1\n');
        });

        it('should move nested directories', () => {
            directoryManager.createDirectories('dir1/dir2');
            directoryManager.createDirectories('dir3');
            directoryManager.moveDirectories('dir1/dir2', 'dir3');
            expect(directoryManager.listDirectories()).toBe('dir1\ndir3\n--dir2\n');
        });

        it('should throw an error if the source directory does not exist', () => {
            expect(() => directoryManager.moveDirectories('dir1', 'dir2')).toThrow('Could not move dir1. Directory dir1 does not exist.');
        });

        it('should throw an error if the destination directory does not exist', () => {
            directoryManager.createDirectories('dir1');
            expect(() => directoryManager.moveDirectories('dir1', 'dir2')).toThrow('Could not move directory to dir2. dir2 does not exist');
        });

        it('should throw an error if the path is invalid', () => {
            expect(() => directoryManager.moveDirectories('', 'dir2')).toThrow('Invalid directory path provided. You must supply a both the source directory and the destination directory.');
        });
    });
});