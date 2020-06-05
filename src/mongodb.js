const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;

const connectionURL = "mongodb://127.0.0.1:27017";
const databaseName = "task-manager";

MongoClient.connect(
    connectionURL,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    },
    (err, client) => {
        if (err) {
            return console.log("Unable to connect with database!");
        }
        const db = client.db(databaseName);
        // db.collection('tasks').insertOne({
        //     name : 'hello',
        //     age : 26
        // });

        db.collection("tasks")
            .insertMany([
                {
                    description: "my first task",
                    completed: false,
                },
                {
                    description: "my first task",
                    completed: false,
                },
                {
                    description: "my first task",
                    completed: true,
                },
            ])
            .then((res) => {
                console.log(res.ops);
            })
            .catch((err) => console.log(err));
    }
);
