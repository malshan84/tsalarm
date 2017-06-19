import {AlarmManager} from "./Alarm/AlarmManager";

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
}

export {ManagerFactory};
export {ManagerKind}