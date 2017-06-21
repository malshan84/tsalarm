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
        switch(cmd){
            case 'create': {
                const resultMessage: ResultMessage = this.create("creator", "* * * * * *", "alarmName", "desc", "room", "id");
                return resultMessage;
            }
            case 'remove': {
                const resultMessage: ResultMessage = this.remove("alarmName", "id");
                return resultMessage;
            }
            case 'on': {
                const resultMessage: ResultMessage = this.on("alarmName", "id");
                return resultMessage;
            }
            case 'off': {
                const resultMessage: ResultMessage = this.off("alarmName", "id");
                return resultMessage;
            }
            case 'show' : {
                const resultMessage: ResultMessage = this.showList();
                return resultMessage;
            }
            default: {
                const resultMessage: ResultMessage = new ResultMessage();
                resultMessage.setMessage('잘못된 명령어 입니다.');
                resultMessage.setResult(false);
            }
        }
        
        return new ResultMessage();
    }

    private create (creator: string, time: string, alarmName: string, desc: string, room: string, id: string) :ResultMessage {
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

    private remove (alarmName: string, id: string): ResultMessage {
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

    private on (alarmName: string, id: string): ResultMessage {
        const resultMessage: ResultMessage = new ResultMessage();
        if(!this.isAlreadyAlarm(alarmName, id)){
            resultMessage.setResult(false);
            resultMessage.setMessage('\"' + alarmName + '\" 으로 등록된 알람이 없습니다.');
            return resultMessage;
        }

        const alarm: Alarm = AlarmManager.alarmMap[alarmName+'_'+id];
        if(alarm.isActive()){
            resultMessage.setResult(false);
            resultMessage.setMessage('이미 켜져있는 알람입니다.');
            return resultMessage;
        }

        this.regist(alarm);

        resultMessage.setResult(true);
        resultMessage.setMessage('\"' + alarmName + '\" 으로 등록된 알람이 시작 되었습니다.');

        return resultMessage;
    }

    private off (alarmName: string, id: string): ResultMessage {
        const resultMessage: ResultMessage = new ResultMessage();
        if(!this.isAlreadyAlarm(alarmName, id)){
            resultMessage.setResult(false);
            resultMessage.setMessage('\"' + alarmName + '\" 으로 등록된 알람이 없습니다.');
            return resultMessage;
        }

        const alarm: Alarm = AlarmManager.alarmMap[alarmName+'_'+id];
        if(!alarm.isActive()){
            resultMessage.setResult(false);
            resultMessage.setMessage('이미 꺼져있는 알람입니다.');
            return resultMessage;
        }

        this.cancel(alarm);

        resultMessage.setResult(true);
        resultMessage.setMessage('\"' + alarmName + '\" 으로 등록된 알람이 중지 되었습니다.');

        return resultMessage;
    }

    private showList (): ResultMessage {
        const resultMessage: ResultMessage = new ResultMessage();
        let list: string = '';
        for(const key in AlarmManager.alarmMap){
            if(AlarmManager.alarmMap.hasOwnProperty(key)) {
                list+=AlarmManager.alarmMap[key].getInfoString()+'\r\n';
            }
        }
        resultMessage.setMessage(list);
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
       alarm.setActive(true);
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