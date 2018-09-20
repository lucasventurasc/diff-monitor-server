export interface ScannerRepository {

    /**
     * stores a new file
     * @returns {Promise<string>} with filePath
     */
    store(clientName : string, data : string) : Promise<string>;

    /**
     * read data of a client name
     * @returns {Promise<string>} with file data read
     */
    read(clientName : string) : Promise<string>;

    /**
     * list clients
     * @returns {Promise<string>} return all client names
     */
    list() : Promise<string[]>;

    /**
     * remove all files
     */
    clear();
}