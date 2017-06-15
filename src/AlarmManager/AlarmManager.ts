import schedule = require('../node_modules/node-schedule')


class AlarmManager{
    private static Instance : AlarmManager;
    public static getInstance() : AlarmManager{
        if(AlarmManager.Instance === null){
            AlarmManager.Instance = new AlarmManager();
        }

        return AlarmManager.Instance;
    }

    private constructor () {

    }
}