import {ManagerFactory} from "./Manager/ManagerFactory"
import {ManagerKind} from "./Manager/ManagerFactory"
import { IManager } from "./Manager/IManager";

const kind : ManagerKind = ManagerKind.Alarm;
const managerFactory : ManagerFactory = ManagerFactory.getInstance();
const manager : IManager = managerFactory.createManager(kind);
manager.run("");
manager.run("");
console.log("hahahah");


