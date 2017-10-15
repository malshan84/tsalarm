import {IManager} from '../IManager'
import {Alarm} from './Alarm'
import {ResultMessage} from '../ResultMessage'
import {ArgsParser} from './ArgsParser'
import * as schedule from 'node-schedule'
import {ParsedCommands} from './ParsedCommands';
import * as request from 'request';

interface AlarmMap {
    [key: string]: Alarm;
}

export class AlarmManager implements IManager {
    private static Instance: AlarmManager = null;
    private static _alarmMap: AlarmMap = {};
    private _id: string = '<default>';
    public static getInstance(): AlarmManager {
        if(AlarmManager.Instance === null){
            AlarmManager.Instance = new AlarmManager();
        }

        return AlarmManager.Instance;
    }

    private constructor () {}

    public setId(id: string): IManager {
        this._id = id;
        return this;
    }

    public run(text: string): ResultMessage {

        let result : ParsedCommands = null;
        if(text.startsWith("@alarm ")) {
            let argsParser = new ArgsParser();
            result = argsParser.parse(text.substr("@alarm ".length));
        } else if(text.startsWith("@알람 ")) {
            let argsParser = new ArgsParser();
            result = argsParser.parse(text.substr("@알람 ".length));
        } else {
            // throw
        }

        const alarmName: string = result.getName();
        const description: string = result.getDesc();
        let resultMessage: ResultMessage = new ResultMessage();   
        const action : string = result.getQuery();
        switch(action){
            case 'create': {
                resultMessage = this.isAlreadyAlarm(alarmName, this._id);
                if(resultMessage.getResult()){
                    break;
                }
                resultMessage = this.create(result.getTime(), alarmName, description, this._id);
                break;
            }
            case 'remove': {
                resultMessage = this.isAlreadyAlarm(alarmName, this._id);
                if(!resultMessage.getResult()){
                    break;
                }
                resultMessage = this.remove(alarmName, this._id);
                break;
            }
            case 'on': {
                resultMessage = this.isAlreadyAlarm(alarmName, this._id);
                if(!resultMessage.getResult()){
                    break;
                }
                resultMessage = this.on(alarmName, this._id);
                break;
            }
            case 'off': {
                resultMessage = this.isAlreadyAlarm(alarmName, this._id);
                if(!resultMessage.getResult()){
                    break;
                }
                resultMessage = this.off(alarmName, this._id);
                break;
            }
            case 'show': {
                resultMessage = this.showList();
                break;
            }
            case 'mute': {
                resultMessage = this.mute(this._id);
                break;
            }
            case 'wake': {
                resultMessage = this.wake(this._id);
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

    private create (time: string, alarmName: string, desc: string, id: string) :ResultMessage {
        const resultMessage: ResultMessage = new ResultMessage();

        const alarm: Alarm = new Alarm(time, alarmName, desc, id);
        this.regist(alarm);
        AlarmManager._alarmMap[alarm.getKey()] = alarm;

        resultMessage.setResult(true);
        resultMessage.setMessage('\"' + alarmName + '\" 알람 생성 완료!!');

        return resultMessage;
    }

    private remove (alarmName: string, id: string): ResultMessage {
        const resultMessage: ResultMessage = new ResultMessage();
       
        const alarm: Alarm = AlarmManager._alarmMap[alarmName+'_'+id];
        this.cancel(alarm);
        delete AlarmManager._alarmMap[alarm.getKey()];

        resultMessage.setMessage('\"' + alarmName + '\" 알람을 제거하였습니다.');
        resultMessage.setResult(true);

        return resultMessage;
    }

    private on (alarmName: string, id: string): ResultMessage {
        const resultMessage: ResultMessage = new ResultMessage();

        const alarm: Alarm = AlarmManager._alarmMap[alarmName+'_'+id];
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

        const alarm: Alarm = AlarmManager._alarmMap[alarmName+'_'+id];
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
        for(const key in AlarmManager._alarmMap){
            if(AlarmManager._alarmMap.hasOwnProperty(key)) {
                list+=AlarmManager._alarmMap[key].getInfoString()+'\r\n';
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

        for(const key in AlarmManager._alarmMap){
            if(AlarmManager._alarmMap.hasOwnProperty(key)) {
                if(AlarmManager._alarmMap[key].getId() === id) {
                    this.cancel(AlarmManager._alarmMap[key]);
                }
            }
        }

        resultMessage.setMessage('모든 알람이 중지 되었습니다.');
        resultMessage.setResult(true);
        return resultMessage;
    } 

    private wake (id: string): ResultMessage {
        const resultMessage: ResultMessage = new ResultMessage();

        for(const key in AlarmManager._alarmMap){
            if(AlarmManager._alarmMap.hasOwnProperty(key)) {
                if(AlarmManager._alarmMap[key].getId() === id) {
                    this.regist(AlarmManager._alarmMap[key]);
                }
            }
        }

        resultMessage.setMessage('모든 알람이 시작 되었습니다.');
        resultMessage.setResult(true);

        return resultMessage;
    }

    private regist(alarm: Alarm) {
        alarm.setJob(schedule.scheduleJob(alarm.getTime(), function(){
           console.log(AlarmManager._alarmMap[alarm.getKey()].getInfoString());
           request.post({
                url: 'http://localhost:8000/create',
                body: {
                desc: alarm.getDescription(),
                alarmName: alarm.getName(),
                id: alarm.getId()
                },
                json: true
            },
                function (err, httpResponse, body) {
                    if (err) {
                        //logger.error(err);
                    }
                }
            );
       }));
       alarm.setActive(true);
    }

    private cancel(alarm: Alarm){
        alarm.getJob().cancel();
        alarm.setActive(false);
    }

    private isAlreadyAlarm(name: string, id: string) :ResultMessage {
        const resultMessage: ResultMessage = new ResultMessage();
        if(AlarmManager._alarmMap[name+'_'+id] === undefined) {
            resultMessage.setResult(false);
            resultMessage.setMessage('\"' + name + '\" 으로 등록된 알람이 없습니다.');
        } else {
            resultMessage.setResult(true);
            resultMessage.setMessage('\"' + name + '\" 으로 등록된 알람이 이미 있습니다. 다른 이름으로 등록해주세요.');
        }
        return resultMessage;
    }
}