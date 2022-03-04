const mongodb = require('mongodb');
const ObjectID = mongodb.ObjectId;
const express = require('express');
var bodyParser = require("body-parser");
const { request, response } = require("express");
const res = require('express/lib/response');

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var MongoClient = mongodb.MongoClient;

const url = "mongodb://localhost:27017";

MongoClient.connect(url, { useNewUrlParser: true }, function (err, db) {
    if (err)
        console.log('Kan geen connectie maken met de MongoDB server. Error!', err);
    else
    {
        const dbo = db.db('claims');

        app.get('/', (request, response) => {
            response.send('<h1>Hi, welcome to our API!</h1>')
        });

        app.post('/claims', (req, res) => {
            if (req.body.code) {
                console.log('Added claim to account ' + req.body.code);
                dbo.collection('claims').insertOne({
                    id: new ObjectID(),
                    code: req.body.code,
                    claimType: req.body.claimType,
                    date: req.body.date,
                    location: req.body.location,
                    status: 'pending'
                })
                res.send('success');
    
            } else {
                const message = 'A code must be given to add the claim to...'
                console.log(message);
                res.send(message)
            }
        });

        app.get('/claims/:code', (req, res) => {
            console.log('getting claims for ' + req.params.code);
            dbo.collection('claims').find({code: parseInt(req.params.code)}).toArray(
                function(error, result) {
                    if (error) {
                        throw error;
                    }
                    console.log(result);
                    res.json(result);
                }
            );
        });

        app.get('/claims/pending', (req, res) => {
            console.log('getting claims for ' + req.params.code);
            dbo.collection('claims').find({status: 'pending'}).toArray(
                function(error, result) {
                    if (error) {
                        throw error;
                    }
                    console.log(result);
                    res.json(result);
                }
            );
        });
        
        app.put('/claims/:id', (req, res) => {
            newValues = {};
            if (req.body.claimType) {
                newValues.claimType = req.body.claimType
            }
            if (req.body.date) {
                newValues.date = req.body.date
            }
            if (req.body.location) {
                newValues.location = req.body.location
            }
            if (req.body.status) {
                newValues.status = req.body.status
            }

            console.log('updating claim for ' + req.params.code);
            dbo.collection('claims').updateOne({id: ObjectID(req.params.id)}, {$set: newValues}, function(error, response) {
                if (error) throw error;
                res.json(response)
            } );
        });

        app.delete('/claims/:id', (req, res) => {
            console.log('deleting claim of ' + req.params.code);
            dbo.collection('claims').deleteOne({id: ObjectID(req.params.id)}, function(error, obj) {
                if (error) throw error;
                res.json(obj);
            } );
        });

        app.listen(3000, () => {
            console.log('Connectie met de MongoDB server is gemaakt. Port 3000 wordt gebruikt.')
        })
    }
})
