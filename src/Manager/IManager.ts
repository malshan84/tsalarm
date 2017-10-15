import {ResultMessage} from './ResultMessage'

interface IManager{
    run(text: string): ResultMessage;
    setId(id: string): IManager;
}

export {IManager}