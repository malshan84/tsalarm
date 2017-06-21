import 'mocha'
import { expect } from 'chai';

import {ManagerFactory} from "../src/Manager/ManagerFactory"
import {ManagerKind} from "../src/Manager/ManagerFactory"
import { IManager } from "../src/Manager/IManager";

const kind : ManagerKind = ManagerKind.Alarm;
const manager : IManager = ManagerFactory.getInstance().createManager(kind);

describe('AlarmManager test', function() {
    it('알람 생성', function(){        
        expect(manager.run("create").getMessage()).to.equal('"alarmName" 알람 생성 완료!!');
    });
    it('동일한 알람 생성', function(){
        expect(manager.run("create").getMessage()).to.equal('"alarmName" 으로 등록된 알람이 이미 있습니다. 다른 이름으로 등록해주세요.');
    });
    it('알람 삭제', function(){
        expect(manager.run("remove").getMessage()).to.equal('"alarmName" 알람을 제거하였습니다.');
    });
});