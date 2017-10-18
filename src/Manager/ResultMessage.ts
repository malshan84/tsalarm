class ResultMessage{
    private message_: string;
    private result_: boolean;

    public constructor() {
        this.message_ = '';
        this.result_ = false;
    }

    public setMessage(message: string): void {
        this.message_ = message;
    }

    public getMessage(): string {
        return this.message_;
    }

    public setResult(result: boolean) {
        this.result_ = result;
    }

    public getResult(): boolean {
        return this.result_;
    }
}

export {ResultMessage};