 // Author: racerKim

export class ParsedCommands {
    _query : string = '';
    _time : string = '';
    _name : string = ''
    _description : string = '';
    // _on : string = "";
    // _off : string = "";
    // _remove : string = "";
    // _list : string = "";

    constructor() {
    }

    public setQuery(query : string) {
        this._query = query;
    }

    public getQuery() {
        return this._query;
    }

    public setTime(time : string) {
        this._time = time;
    }

    public getTime() {
        return this._time;
    }

    public setName(name : string) {
        this._name = name;
    }

    public getName() {
        return this._name;
    }

    public setDesc(description : string) {
        this._description = description;
    }

    public getDesc() {
        return this._description;
    }

}

