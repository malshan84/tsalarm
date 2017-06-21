import {ResultMessage} from './ResultMessage'

interface IManager{
    run(cmd: string): ResultMessage;
}

export {IManager}