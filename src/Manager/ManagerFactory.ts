import {AlarmManager} from "./Alarm/AlarmManager";
import { IManager } from "./IManager";

enum ManagerKind{
    Alarm
}

class ManagerFactory {
    static Instance: ManagerFactory = null;
    static getInstance(): ManagerFactory {
        if(this.Instance === null){
            this.Instance = new ManagerFactory();
        }
        return this.Instance;
    }

    private constructor() {}

    public createManager(kind: ManagerKind): IManager {
        switch(kind){
            case ManagerKind.Alarm:
            {
                return AlarmManager.getInstance();
            }
            default: {
                return null;
            }
        }
    }

    public getKind(text: string) {
        if(text.startsWith("@alarm ") || text.startsWith("@알람")) {
            return ManagerKind.Alarm;
        }
        return ManagerKind.Alarm;
    }
}

export {ManagerFactory};
export {ManagerKind}