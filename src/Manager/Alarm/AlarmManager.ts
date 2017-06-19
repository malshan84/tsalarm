import {Alarm} from './Alarm'
import {ResultMessage} from '../ResultMessage'
import * as schedule from 'node-schedule'

interface AlarmMap {
    [key: string]: Alarm;
}

export class AlarmManager implements IManager{
    private static Instance : AlarmManager = null;
    private static alarmList : AlarmMap={};
    
    public static getInstance() : AlarmManager{
        if(AlarmManager.Instance === null){
            AlarmManager.Instance = new AlarmManager();
        }

        return AlarmManager.Instance;
    }

    private constructor () {

    }
    run(cmd: string) : ResultMessage{
        const resultMessage : ResultMessage = new ResultMessage();
        this.create("creator", "* * * * * *", "alarmNae", "desc", "room", "id");
        return resultMessage;
    }

    create (creator:string, time:string, alarmName:string, desc:string, room:string, id:string) {
       const alarm : Alarm = new Alarm(creator,time, alarmName, desc, room, id);
       alarm.setJob(schedule.scheduleJob(time, function(){
           console.log(AlarmManager.alarmList[alarmName].getInfoString());
       }));

       AlarmManager.alarmList[alarmName] = alarm;
    }
}