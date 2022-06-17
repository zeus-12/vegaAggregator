const RUN_AS = "AGGREGATOR";
switch (RUN_AS) {
    case "AGGREGATOR": {
        console.log("Starting the application as AGGREGATOR.")
        require('./resources/acceleron-aggregator/app');
        break;
    }
    case "SERVER" : {
        console.log("Starting the application as SERVER.")
        require('./resources/acceleron-server/app');
        break;
    }
    default:{
        console.log("Error : Not sure what to do! Run as Server or Aggregator?")
    }
}