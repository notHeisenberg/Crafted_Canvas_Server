const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()

const app = express()
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());


// connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pgsiu4c.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});



async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const craftCollection = client.db('textileArt').collection('crafts')
        const userCollection = client.db('textileArt').collection('user')


        app.get('/crafts', async (req, res) => {
            const cursor = craftCollection.find()
            const result = await cursor.toArray()
            res.send(result)
        })

        app.get('/crafts/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await craftCollection.findOne(query)
            res.send(result)
        })

        app.post('/crafts', async (req, res) => {
            const newaCraft = req.body
            const result = await craftCollection.insertOne(newaCraft)
            res.send(result)
        })

        app.put('/crafts/:id', async (req, res) => {
            const id = req.params.id
            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true }
            const update = req.body;
            console.log(update)
            // Fields to be unset (removed)
            const fieldsToRemove = {
                description: "",
                processingTime: "",
                status: "",
                subcategory: ""
                // Add more fields to remove here if needed
            };
            const updatedCraft = {
                $set: {
                    image: update.image,
                    item_name: update.item_name,
                    subcategory_Name: update.subcategory_Name,
                    short_description: update.short_description,
                    price: update.price,
                    rating: update.rating,
                    customization: update.customization,
                    processing_time: update.processing_time,
                    stockStatus: update.stockStatus
                },
                $unset: fieldsToRemove // Use $unset to remove fields
            }

            const result = await craftCollection.updateOne(filter, updatedCraft, options)
            res.send(result)
        })

        app.delete('/crafts/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await craftCollection.deleteOne(query)
            console.log(result)
            res.send(result)
        })

        // User informations
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email
            // console.log(email)
            const query = { email }
            const result = await userCollection.findOne(query)
            // console.log(result)
            res.send(result)
        })

        app.get('/users', async (req, res) => {
            const cursor = userCollection.find()
            const result = await cursor.toArray()
            res.send(result)
        })

        app.post('/users', async (req, res) => {
            const user = req.body
            const result = await userCollection.insertOne(user)
            res.send(result)
        })

        // match user and craft items 
        app.get('/crafts/user/:email', async (req, res) => {
            const email = req.params.email

            // const query = { email }
            // const user = await userCollection.findOne(query)

            // Find crafts matching the user's email
            const crafts = await craftCollection.find({ email }).toArray();
            // console.log(crafts)

            res.send(crafts)
        });


        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir)
app.get('/', (req, res) => {
    res.send('Art & craft created')
})

app.listen(port, () => {
    console.log(`Art & craft server is running on port ${port}`)
})