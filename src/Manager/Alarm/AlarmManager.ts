import {IManager} from '../IManager'
import {Alarm} from './Alarm'
import {ResultMessage} from '../ResultMessage'
import {ArgsParser} from './ArgsParser'
import * as schedule from 'node-schedule'
import {ParsedCommands} from './ParsedCommands';
import * as request from 'request';
import {MongoDB} from '../../db/mongodb-helper';
//import {Logger} from 'logger';
var logger = require('logger').createLogger('server.log');

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
            AlarmManager.Instance.initAlarm();
        }

        return AlarmManager.Instance;
    }

    private constructor () {}

    private initAlarm(): void {
        function initFunc(alarmModels: any) {
            logger.info("init 중입니다!");
            console.log("init 중입니다!");
            alarmModels.forEach(function (model: any) {
                let alarmModel = model._doc;
                let alarmName = alarmModel.alarmName;
                let id = alarmModel.id;
                let alarm = new Alarm(alarmModel.time, alarmName, alarmModel.desc, alarmModel.id);
                AlarmManager._alarmMap[alarm.getKey()] = alarm;
                if (alarmModel.active === true) {
                    AlarmManager.getInstance().regist(alarm);
                }
            });
        };
        let dbInstance: MongoDB = new MongoDB();
        dbInstance.allFind(initFunc);
        return;
    }

    public setId(id: string): IManager {
        this._id = id;
        return this;
    }

    public getParsedCommands(text: string, headers: string[]): ParsedCommands {
        let result: ParsedCommands = null;
        for(let header of headers) {
            if(text.startsWith(header)) {
                try {
                    result = ArgsParser.parse(text.substr(header.length));
                    break;
                } catch (e) {
                    let message: string = null;
                    if(e.message.startsWith('Example:')) {
                        message = e.message;
                    } else {
                        message = '잘못된 명령어가 입력되었습니다.';
                    }
                    throw Error(message);
                }
            }
        }
        return result;
    }

    public run(text: string): ResultMessage {
        let headers: string[] = ["@alarm ", "@알람 "];
        let result: ParsedCommands = this.getParsedCommands(text, headers);
        if(result === null) {
            return new ResultMessage();
        }
        let resultMessage: ResultMessage = new ResultMessage();           

        const action : string = result.getQuery();
        switch(action){
            case 'create': {
                resultMessage = this.isAlreadyAlarm(result.getName(), this._id);
                if(resultMessage.getResult()){
                    break;
                }
                resultMessage = this.create(result.getTime(), result.getName(), result.getDesc(), this._id);
                break;
            }
            case 'remove': {
                resultMessage = this.isAlreadyAlarm(result.getName(), this._id);
                if(!resultMessage.getResult()){
                    break;
                }
                resultMessage = this.remove(result.getName(), this._id);
                break;
            }
            case 'on': {
                resultMessage = this.isAlreadyAlarm(result.getName(), this._id);
                if(!resultMessage.getResult()){
                    break;
                }
                resultMessage = this.on(result.getName(), this._id);
                break;
            }
            case 'off': {
                resultMessage = this.isAlreadyAlarm(result.getName(), this._id);
                if(!resultMessage.getResult()){
                    break;
                }
                resultMessage = this.off(result.getName(), this._id);
                break;
            }
            case 'list': {
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
                url: 'http://localhost:8000/alarm',
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