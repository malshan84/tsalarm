import {IManager} from '../IManager'
import {Alarm} from './Alarm'
import {ResultMessage} from '../ResultMessage'
import * as schedule from 'node-schedule'

interface AlarmMap {
    [key: string]: Alarm;
}

export class AlarmManager implements IManager {
    private static Instance: AlarmManager = null;
    private static alarmMap: AlarmMap={};
    
    public static getInstance(): AlarmManager {
        if(AlarmManager.Instance === null){
            AlarmManager.Instance = new AlarmManager();
        }

        return AlarmManager.Instance;
    }

    private constructor () {}

    public run(cmd: string): ResultMessage {
        var resultMessage: ResultMessage = new ResultMessage();
        switch(cmd){
            case 'create': {
                resultMessage = this.create("creator", "* * * * * *", "alarmName", "desc", "room", "id");
            }
            case 'remove': {
                resultMessage = this.remove("alarmName", "id");
            }
        }
        
        return resultMessage;
    }

    public create (creator: string, time: string, alarmName: string, desc: string, room: string, id: string) :ResultMessage {
        const resultMessage: ResultMessage = new ResultMessage();

        const alarm: Alarm = new Alarm(creator,time, alarmName, desc, room, id);
        if (this.isAlreadyAlarm(alarmName,id)) {
            resultMessage.setResult(false);
            resultMessage.setMessage('\"' + alarmName + '\" 으로 등록된 알람이 이미 있습니다. 다른 이름으로 등록해주세요.');
            return resultMessage;
        }
        this.regist(alarm);
        AlarmManager.alarmMap[alarm.getAlarmKey()] = alarm;

        resultMessage.setResult(true);
        resultMessage.setMessage('\"' + alarmName + '\" 알람 생성 완료!!');
        return resultMessage;
    }

    public remove (alarmName:string, id:string): ResultMessage{
        const resultMessage: ResultMessage = new ResultMessage();
        if(!this.isAlreadyAlarm(alarmName, id)){
            resultMessage.setResult(false);
            resultMessage.setMessage('\"' + alarmName + '\" 으로 등록된 알람이 없습니다.');
            return resultMessage;
        }
        const alarm: Alarm = AlarmManager.alarmMap[alarmName+'_'+id];
        this.cancel(alarm);
        delete AlarmManager.alarmMap[alarm.getAlarmKey()];

        resultMessage.setMessage('\"' + alarmName + '\" 알람을 제거하였습니다.');
        resultMessage.setResult(true);

        return resultMessage;
    }

    private regist(alarm: Alarm) {
        alarm.setJob(schedule.scheduleJob(alarm.getTime(), function(){
            /**
             * TODO
             * 알람 메시지 구현
             */
           console.log(AlarmManager.alarmMap[alarm.getAlarmKey()].getInfoString());
       }));
       alarm.setActive(false);
    }

    private cancel(alarm: Alarm){
        alarm.getJob().cancel();
        alarm.setActive(false);
    }

    private isAlreadyAlarm(name: string, id: string) :boolean {
        if(AlarmManager.alarmMap[name+'_'+id] === undefined) {
            return false;
        }
        return true;
    }
}