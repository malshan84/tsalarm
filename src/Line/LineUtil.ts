import * as line from "@line/bot-sdk";

export function getSourceId(source: Line.EventSource): string {
    let id: string = '';
    switch(source.type) {
    case 'user':
        id = source.userId;
        break;
    case 'group':
        id = source.groupId;
        break;
    case 'room':
        id = source.roomId;
        break;
    default:
        break;
    }
    return id;
}