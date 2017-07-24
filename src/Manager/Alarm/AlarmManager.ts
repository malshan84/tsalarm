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

    public run(action: string): ResultMessage {
        const alarmName: string = 'alarmName';
        const id: string = 'id';
        let resultMessage: ResultMessage = new ResultMessage();   

        switch(action){
            case 'create': {
                resultMessage = this.isAlreadyAlarm(alarmName, id);
                if(resultMessage.getResult()){
                    break;
                }
                resultMessage = this.create("creator", "* * * * * *", alarmName, "desc", "room", id);
                break;
            }
            case 'remove': {
                resultMessage = this.isAlreadyAlarm(alarmName, id);
                if(!resultMessage.getResult()){
                    break;
                }
                resultMessage = this.remove(alarmName, id);
                break;
            }
            case 'on': {
                resultMessage = this.isAlreadyAlarm(alarmName, id);
                if(!resultMessage.getResult()){
                    break;
                }
                resultMessage = this.on(alarmName, id);
                break;
            }
            case 'off': {
                resultMessage = this.isAlreadyAlarm(alarmName, id);
                if(!resultMessage.getResult()){
                    break;
                }
                resultMessage = this.off(alarmName, id);
                break;
            }
            case 'show': {
                resultMessage = this.showList();
                break;
            }
            case 'mute': {
                resultMessage = this.mute(id);
                break;
            }
            case 'wake': {
                resultMessage = this.wake(id);
                break;
            }
            default: {
                resultMessage.setMessage('\'' + action + '\' 등록되지 않은 명령어 입니다.');
                resultMessage.setResult(false);
                break;
            }
        }
        
        return resultMessage;
    }

    private create (creator: string, time: string, alarmName: string, desc: string, room: string, id: string) :ResultMessage {
        const resultMessage: ResultMessage = new ResultMessage();

        const alarm: Alarm = new Alarm(creator,time, alarmName, desc, room, id);
        this.regist(alarm);
        AlarmManager.alarmMap[alarm.getAlarmKey()] = alarm;

        resultMessage.setResult(true);
        resultMessage.setMessage('\"' + alarmName + '\" 알람 생성 완료!!');

        return resultMessage;
    }

    private remove (alarmName: string, id: string): ResultMessage {
        const resultMessage: ResultMessage = new ResultMessage();
       
        const alarm: Alarm = AlarmManager.alarmMap[alarmName+'_'+id];
        this.cancel(alarm);
        delete AlarmManager.alarmMap[alarm.getAlarmKey()];

        resultMessage.setMessage('\"' + alarmName + '\" 알람을 제거하였습니다.');
        resultMessage.setResult(true);

        return resultMessage;
    }

    private on (alarmName: string, id: string): ResultMessage {
        const resultMessage: ResultMessage = new ResultMessage();

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
        if (list.length === 0) {
            list = '등록된 알람이 없습니다!';
        }
        resultMessage.setMessage(list);
        resultMessage.setResult(true);

        return resultMessage;
    }

    private mute (id: string): ResultMessage {
        const resultMessage: ResultMessage = new ResultMessage();

        for(const key in AlarmManager.alarmMap){
            if(AlarmManager.alarmMap.hasOwnProperty(key)) {
                if(AlarmManager.alarmMap[key].getId() === id) {
                    this.cancel(AlarmManager.alarmMap[key]);
                }
            }
        }

        resultMessage.setMessage('모든 알람이 중지 되었습니다.');
        resultMessage.setResult(true);
        return resultMessage;
    }

    private wake (id: string): ResultMessage {
        const resultMessage: ResultMessage = new ResultMessage();

        for(const key in AlarmManager.alarmMap){
            if(AlarmManager.alarmMap.hasOwnProperty(key)) {
                if(AlarmManager.alarmMap[key].getId() === id) {
                    this.regist(AlarmManager.alarmMap[key]);
                }
            }
        }

        resultMessage.setMessage('모든 알람이 시작 되었습니다.');
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

    private isAlreadyAlarm(name: string, id: string) :ResultMessage {
        const resultMessage: ResultMessage = new ResultMessage();
        if(AlarmManager.alarmMap[name+'_'+id] === undefined) {
            resultMessage.setResult(false);
            resultMessage.setMessage('\"' + name + '\" 으로 등록된 알람이 없습니다.');
        }else{
            resultMessage.setResult(true);
            resultMessage.setMessage('\"' + name + '\" 으로 등록된 알람이 이미 있습니다. 다른 이름으로 등록해주세요.');
        }
        return resultMessage;
    }
}