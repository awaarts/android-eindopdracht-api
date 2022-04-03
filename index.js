const mongodb = require('mongodb');
const ObjectID = mongodb.ObjectId;
const express = require('express');
var bodyParser = require("body-parser");
const { request, response } = require("express");
const res = require('express/lib/response');
const bcrypt = require('bcrypt')
const saltRound = 10;

var app = express();
app.use(bodyParser.json({limit: '50mb', extended: true}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

var MongoClient = mongodb.MongoClient;

const url = "mongodb://localhost:27017";

MongoClient.connect(url, { useNewUrlParser: true }, function (err, db) {
    if (err)
        console.log('Kan geen connectie maken met de MongoDB server. Error!', err);
    else
    {
        const dbo = db.db('IOS-db');

        app.get('/', (request, response) => {
            response.send('<h1>Hi, welcome to our API!</h1>')
        });

        app.post('/account', (req, res) => {
            console.log(req.body)
            if (req.body.username && req.body.password) {
                console.log('Added account ' + req.body.username);
                dbo.collection('account').findOne({username: req.body.username})
                .then((user) => {
                    console.log(user)
                    if (!user) {
                        bcrypt.hash(req.body.password, saltRound).then((password) => {
                            dbo.collection('account').insertOne({
                                id: new ObjectID(),
                                username: req.body.username, unique: true,
                                password: password
                            });
                            res.status(200);
                            res.json(JSON.parse('{"success": true}'));
                        }).catch((e) => {
                            res.status(500);
                            res.json(e)
                        })
                    } else {
                        const message = 'The username given already exist!'
                        console.log(message);
                        res.status(403)
                        res.json(JSON.parse('{"success": false}'));
                    }
                }).catch((e) => {
                    res.status(500);
                    res.json(e);
                });
            } else {
                res.status(442)
                res.json(JSON.parse('{"success": false}'));
            }
        });

        app.get("/account", (req, res) => {
            if (req.query.username && req.query.password) {
                dbo.collection('account').findOne({username: req.query.username})
                    .then((user) => {
                        console.log(user)
                        if (!user) {
                            res.status(404).json({message: 'account not found'})
                        } else {
                            bcrypt.compare(req.query.password, user.password).then((checkResult) => {
                                if (checkResult) {
                                    res.status(200).json({success: true});
                                } else {
                                    res.status(400).json({success: false});
                                }
                            }).catch(error => {
                                res.status(400).json({message: error.message})
                            });
                        }
                    })
                    .catch((error) => {res.status(400).json({message: error.message})})
            } else {
                res.status(400).json({message: 'send both username and password for this'})
            }
        });

        app.post('/journey', (req, res) => {
            console.log(req.body)
            if (req.body.username || req.body.userid) {
                const userparam = req.body.username? {username: req.body.username} : {userid: req.body.userid}

                dbo.collection('account').findOne(userparam)
                .then((user) => {
                    console.log('getting here', user)

                    if (user) {
                        dbo.collection('journey').insertOne({
                            id: new ObjectID(),
                            userid: user._id,
                            name: req.body.name,
                            state: "open"
                        });
                        res.status(200);
                        res.json(JSON.parse('{"success": true}'));
                    } else {
                        res.status(404)
                        res.json(JSON.parse('{"success": false}'));
                    }
                }).catch((e) => {
                    res.status(500);
                    res.json(e);
                });
            } else {
                res.status(442)
                res.json(JSON.parse('{"success": false}'));
            }
        });

        app.put("/journey", (req, res) => {
            if (req.body.id) {
                dbo.collection('journey').findOne({id: ObjectID(req.body.id)})
                    .then((journey) => {
                        if (!journey) {
                            res.status(404).json({message: 'journey not found'})
                        } else {
                            let newValues = {};
                            if (req.body.name) {
                                newValues.name = req.body.name;
                            }

                            if (req.body.userid) {
                                newValues.userid = req.body.userid;
                            }
                            dbo.collection('journey').updateOne({id: journey.id}, {$set: newValues}, function(error, response) {
                                if (error) throw error;
                                res.json({"success": true})
                            })
                        }
                    })
                    .catch((error) => {
                        console.log(error.message)
                        res.status(400).json({message: error.message})
                    })
            } else {
                res.status(400).json({message: 'send journey id for this'})
            }
        });

        app.get("/journey", (req, res) => {
            if (req.query.username) {
                dbo.collection('account').findOne({username: req.query.username})
                    .then((user) => {
                        if (!user) {
                            res.status(404).json({message: 'account not found'})
                        } else {
                            if (req.query.status) {
                                dbo.collection('journey').find({userid: user._id, state: req.query.status})
                                    .toArray((err, result) => {
                                        if (err) {
                                            res.status(400);
                                        }
                                        res.status(200).json(result)
                                    })
                            } else {
                                dbo.collection('journey').find({userid: user._id})
                                    .toArray((err, result) => {
                                        if (err) {
                                            res.status(400);
                                        }
                                        res.status(200).json(result)
                                    })
                            }
                        }
                    })
                    .catch((error) => {res.status(400).json({message: error.message})})
            } else {
                res.status(400).json({message: 'send username for this'})
            }
        });
    
        app.listen(3000, () => {
            console.log('Connectie met de MongoDB server is gemaakt. Port 3000 wordt gebruikt.')
        });
    }
})