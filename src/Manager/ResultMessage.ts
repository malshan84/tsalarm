class ResultMessage{
    private message_ : string;
    private result_ : boolean;

    setMessage(message : string) : void{
        this.message_ = message;
    }

    getMessage():string{
        return this.message_;
    }

    setResult(result : boolean){
        this.result_ = result;
    }

    getResult():boolean{
        return this.result_;
    }
}

export {ResultMessage};