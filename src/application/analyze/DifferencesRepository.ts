export interface DifferencesRepository {

    /**
     * stores a new file
     * @returns {Promise<string>} with filePath
     */
    store(clientName: string, data: string): Promise<string>;

    /**
     * read data of a client name
     * @returns {Promise<string>} with file data read
     */
    read(clientName: string): Promise<string>;

    /**
     * list clients
     * @returns {Promise<string>} return all client files
     */
    list(): Promise<string[]>;

    /**
     * @returns {Promise<string>} return all client files
     */
    listNames(): Promise<string[]>;

    /**
     * remove all files
     */
    clear();
}