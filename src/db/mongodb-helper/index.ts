
var mongoose = require('mongoose');
  // DEFINE MODEL
var Book = require('./models/book');

var db_server  = process.env.DB_ENV || 'primary';

  // CONNECT TO MONGODB SERVER
mongoose
  .connect('mongodb://localhost/db')
  .then((res: Request) => {
      // CONNECTED TO MONGODB SERVER
    console.log("Connected to mongod server");
  })
  .catch(console.error);
     
export class MongoDB {
  public preObject: any;
  public newObject: any;

  public constructor(preObject?: any, newObject?: any) {
  if (!(this instanceof MongoDB)) {
    return new MongoDB(preObject, newObject);
  }
  this.preObject = preObject;
  this.newObject = newObject;
  }
  public save(): void {
    saveObject(this.preObject)
  }

public allFind(user: any): void {
  Book.find({}, function(err: any = {}, users: any = {}){
    if(err) throw failureCallback(err);
    else 
      user(users);
  }).then(successCallback("AllFind "));
}

public findOneAndUpdate()
{
  findOneAndUpdate(this.preObject,this.newObject)
}

public remove()
{
  findOneAndRemove(this.preObject)
}

public close()
{
  mongoose.disconnect();
}


};


var gracefulExit = function() { 
  mongoose.connection.close(function () {
    console.log('Mongoose default connection with DB :' + db_server + ' is disconnected through app termination');
    process.exit(0);
  });
}

function successCallback(str: string) {
  console.log(str + 'success!!');
}
  
function failureCallback(err: string) {
  console.error('fail..', err);
}
  
function saveObject(obj: any) {
  new Book(obj)
    .save()
    .then(successCallback("Save "))
    .catch(failureCallback);
}

function findOneAndUpdate(preObj: any, updateObj: any){
  Book.findOneAndUpdate(preObj,updateObj)
    .then(successCallback("Update "))
    .catch(failureCallback);
} 

function findOneAndRemove(obj: any){
  Book.findOneAndRemove(obj)
    .then(successCallback("Remove "))
    .catch(failureCallback);
}

process.on('SIGINT', gracefulExit).on('SIGTERM', gracefulExit);

