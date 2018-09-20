class ClientLink {

    private _url: string;
    private _id: string;

    constructor(url, id) {
        this._url = url;
        this._id = id;
    }

    get url() {
        return this._url;
    }

    get id() {
        return this._id;
    }

    //change password logic to prod
    password(): string {
        return ((parseInt(this._id) - 122) * 2122).toString();
    }

    name(): string {
        return this.url.replace("http://www.", "")
                       .replace("https://www.", "")
                       .replace("http://", "")
                       .replace("https://", "")
                       .replace(":", "\.")
                       .split("\.")[0]
                       .toLowerCase();
    }
}

export { ClientLink };
