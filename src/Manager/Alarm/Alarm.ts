import {Job} from 'node-schedule'

export class Alarm {
    
    private time_: string;
    private alarmName_: string;
    private desc_: string = "";
    private active_: boolean = true;
    private id_: string;
    private job_: Job;

    constructor(time: string, alarmName: string, desc: string, id: string) {
        this.time_ = time;
        this.alarmName_ = alarmName;
        this.desc_ = desc;
        this.id_ = id;
    }

    public setJob(job: Job): void {
        this.job_ = job;
    }

    public getJob(): Job {
        return this.job_;
    }

    public isActive(): boolean {
        return this.active_;
    }

    public setActive(active: boolean) {
        this.active_ = active;
    }

    public getName(): string{
        return this.alarmName_;
    }

    public getKey(): string {
        return this.alarmName_+'_'+this.id_;
    }

    public getTime(): string {
        return this.time_;
    }

    public getId(): string {
        return this.id_;
    }
    
    public getDescription(): string{
        return this.desc_;
    }

    public getInfoString(): string {
        let info: string = "";

        info += "이름: " + this.alarmName_;
        info += "\r\n시간: " + this.time_;
        info += "\r\n설명: "+ this.desc_;

        let status :string;
        if(this.active_){
            status = "켜짐";
        }else{
            status = "꺼짐";
        }

        info += "\r\n상태: "+ status;
        info += "\r\n";

        return info;
    }
}