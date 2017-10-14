 // Author: racerKim

import {ArgumentParser} from 'argparse';
import {ParsedCommands} from './ParsedCommands';
import * as fs from "fs";

var argsParser : any = null;
var text : string = null;

function getHelp(file : string) : string {
  if(text == null) {
	  text = fs.readFileSync(file, 'utf8');
  }
  return text;
}

 export class ArgsParser {
   parser: ArgumentParser;

   public constructor() {
    this.parser = new ArgumentParser({
      version: '0.0.1',
      addHelp: true,
      description: 'Alarm bot Argument Parser'
    });
    this.parser.addArgument(
      ['-c', '-mk'], {
        help: 'create alarm',
        nargs: 0
      }
    );
    this.parser.addArgument(
      ['-t', '-time'], {
        help: 'time',
        nargs: 1
      }
    );
    this.parser.addArgument(
      ['-n', '-name'], {
        help: 'name',
        nargs: 1
      }
    );
    this.parser.addArgument(
      ['-d', '-description'], {
        help: 'description',
        nargs: 1
      }
    );
    this.parser.addArgument(
      ['-ls', '-list'], {
        help: 'list',
        nargs: 0
      }
    );
    this.parser.addArgument(
      ['-on'], {
        help: 'activate alram',
        nargs: 1
      }
    );
    this.parser.addArgument(
      ['-off'], {
        help: 'deactivate alram',
        nargs: 1
      }
    );
    this.parser.addArgument(
      ['-m', '-mute'], {
        help: 'mute all alarms',
        nargs: 0
      }
    );
    this.parser.addArgument(
      ['-w', '-wake'], {
        help: 'wake all alarms',
        nargs: 0
      }
    )
    this.parser.addArgument(
      ['-rm', '-remove'], {
        help: 'remove alram',
        nargs: 1
      }
    );
   }
   public static isUndefined(str : string) : boolean {
     return !str;
   }

   static wsReplacer : string = '#_#'; // white space 치환 문자

   public static mergeQuotedStr(strArr : Array<string>) : Array<string> {
     var mergedArr : Array<string> = new Array<string>();
     for (var i = 0; i < strArr.length; i++) {
       var str = strArr[i];
       if (strArr[i].match(/^"/)) {
         var strQuoted = "";
         for (var j = i; j < strArr.length; j++) {
           if (!strArr[j].match(/"$/)) {
             strQuoted += strArr[j] + ArgsParser.wsReplacer;
           } else {
             strQuoted += strArr[j];
             i = j;
             break;
           }
         }
         mergedArr.push(strQuoted.replace(/"/g, ''));
       } else {
         mergedArr.push(str);
       }
     }
     return mergedArr;
   }

   public exit(status : string, message : string) {
    let helpStr : string = getHelp('MasterOfTime/model/help.txt');
    throw Error(helpStr);
   }

   public parse(commands : string) : ParsedCommands {
     let formattedStr : string[] = ArgsParser.mergeQuotedStr(commands.split(' '));
     let parsedArgs = this.parser.parseArgs(formattedStr);
     let result : ParsedCommands = new ParsedCommands();

     const argNames : string[] = ['c', 'mk', 'n', 'name','d', 'description', 't', 'time','on', 'off', 'm', 'mute',
     'w', 'wake', 'rm', 'remove', 'ls', 'list'];
     argNames.forEach(function(element : string) {
       let command : string = parsedArgs.get(element);
       const wsReplacerRegex : RegExp = /#_#/g; // wsReplacer를 찾는 정규표현식
       if (! (ArgsParser.isUndefined(command))) {
         switch (element) {
           case 'c':
           case 'mk':
             result.setQuery('create');
             break;
           case 'n':
           case 'name':
             result.setName(command[0].replace(wsReplacerRegex, ' '));
             break;
           case 'd':
           case 'description':
             result.setDesc(command[0].replace(wsReplacerRegex, ' '));
             break;
           case 't':
           case 'time':
             result.setTime(command[0].replace(wsReplacerRegex, ' '));
             break;
           case 'on':
             result.setQuery('on');
             result.setName(command[0].replace(wsReplacerRegex, ' '));
             break;
           case 'off':
             result.setQuery('off');
             result.setName(command[0].replace(wsReplacerRegex, ' '));
             break;
           case 'm':
           case 'mute':
             result.setQuery('mute');
             break;
           case 'w':
           case 'wake':
             result.setQuery('wake');
             break;
           case 'rm':
           case 'remove':
             result.setQuery('remove');
             result.setName(command[0].replace(wsReplacerRegex, ' '));
             break;
           case 'ls':
           case 'list':
             result.setQuery('list');
             break;
           default:
             break;
         }
       } else {
         // do logging
       }
     });
     return result;
   }

 }
 