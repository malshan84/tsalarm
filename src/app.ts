import {ManagerFactory} from "./Manager/ManagerFactory"
import {ManagerKind} from "./Manager/ManagerFactory"

const kind : ManagerKind = ManagerKind.Alarm;
const managerFactory : ManagerFactory = ManagerFactory.getInstance();
const manager : IManager = managerFactory.createManager(kind);
manager.run("");
console.log("hahahah");


