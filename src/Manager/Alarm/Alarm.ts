import {Job} from 'node-schedule'

export class Alarm {
    
    private creator_: string;
    private time_: string;
    private alarmName_: string;
    private desc_: string = "";
    private room_: string;
    private active_: boolean = true;
    private id_: string;
    private job_: Job;

    constructor(creator: string, time: string, alarmName: string, desc: string, room: string, id: string) {
        this.creator_ = creator;
        this.time_ = time;
        this.alarmName_ = alarmName;
        this.desc_ = desc;
        this.room_ = room;
        this.id_ = id;
    }

    public setJob(job: Job): void {
        this.job_ = job;
    }

    public getJob(): Job {
        return this.job_;
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