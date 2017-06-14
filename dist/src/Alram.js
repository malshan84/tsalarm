"use strict";
var Alarm = (function () {
    function Alarm(creator, time, alarmName, desc, room, id) {
        this.desc_ = "";
        this.active_ = true;
        this.creator_ = creator;
        this.time_ = time;
        this.alarmName_ = alarmName;
        this.desc_ = desc;
        this.room_ = room;
        this.id_ = id;
    }
    Alarm.prototype.getInfoString = function () {
        var info = "";
        info += "이름: " + this.alarmName_;
        info += "\r\n시간: " + this.time_;
        info += "\r\n설명: " + this.desc_;
        var status;
        if (this.active_) {
            status = "켜짐";
        }
        else {
            status = "꺼짐";
        }
        info += "\r\n상태: " + status;
        info += "\r\n";
        return info;
    };
    return Alarm;
}());
