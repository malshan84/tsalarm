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
    it('알람 보기', function(){        
        expect(manager.run("show").getMessage())
        .to.equal(
            "이름: alarmName\r\n"+
            "시간: * * * * * *\r\n"+
            "설명: desc\r\n"+
            "상태: 켜짐\r\n\r\n"
            );
    });       
    it('동일한 알람 생성', function(){
        expect(manager.run("create").getMessage()).to.equal('"alarmName" 으로 등록된 알람이 이미 있습니다. 다른 이름으로 등록해주세요.');
    });
    it('알람 끄기', function(){
        expect(manager.run("off").getMessage()).to.equal('"alarmName" 으로 등록된 알람이 중지 되었습니다.');
    });
    it('알람 또 끄기', function(){
        expect(manager.run("off").getMessage()).to.equal('이미 꺼져있는 알람입니다.');
    });
    it('알람 켜기', function(){
        expect(manager.run("on").getMessage()).to.equal('"alarmName" 으로 등록된 알람이 시작 되었습니다.');
    });
    it('알람 또 켜기', function(){
        expect(manager.run("on").getMessage()).to.equal('이미 켜져있는 알람입니다.');
    });
    it('알람 삭제', function(){
        expect(manager.run("remove").getMessage()).to.equal('"alarmName" 알람을 제거하였습니다.');
    });
    it('동일한 알람 삭제', function(){
        expect(manager.run("remove").getMessage()).to.equal('"alarmName" 으로 등록된 알람이 없습니다.');
    });
    it('없는 알람 끄기', function(){
        expect(manager.run("off").getMessage()).to.equal('"alarmName" 으로 등록된 알람이 없습니다.');
    });
    it('없는 알람 켜기', function(){
        expect(manager.run("off").getMessage()).to.equal('"alarmName" 으로 등록된 알람이 없습니다.');
    });
    it('빈 리스트 보기', function(){
        expect(manager.run("show").getMessage()).to.equal('등록된 알람이 없습니다!');
    });
});