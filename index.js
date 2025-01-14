const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const port = process.env.PORT || 5000;

const app = express();


// const corsOption = {
//     origin: ['http://localhost:5173/'],
//     Credential: true,
//     optionSuccessStatus: 200
// }

console.log(process.env.DB_PASS);

app.use(cors())
app.use(express.json())


// const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ysdrtdj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
        // await client.connect();

        const serviceCollection = client.db('homeService').collection('services');
        const bookingCollection = client.db('homeService').collection('booked');

        app.get('/services', async (req, res) => {
            const cursor = serviceCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        app.post('/services', async (req, res) => {
            const newService = req.body;
            console.log(newService);
            const result = await serviceCollection.insertOne(newService);
            res.send(result);
        })

        // get a single service data from db using service id
        app.get('/services/:id', async(req, res) => {
            const id = req.params.id;
            const query = { _id:new ObjectId(id) };
            const result = await serviceCollection.findOne(query);
            res.send(result);

        })


        app.get('/manageService/:email', async (req, res) => {
            console.log(req.params.email);
            const result = await serviceCollection.find({ email: req.params.email }).toArray();
            res.send(result);
        })

        app.get('/services/:id', async(req, res) => {
            const id = req.params.id;
            const query = {_id: new ObjectId(id)}
            const result = await serviceCollection.findOne(query);
            res.send(result);
        })

        app.put('/services/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updatedService = req.body;
            const service = {
                $set: {
                    name: updatedService.name,
                    description: updatedService.description,
                    price: updatedService.price,
                    area: updatedService.area,
                    email: updatedService.email,
                    uName: updatedService.uName,
                    image: updatedService.image
                }
            }
            const result = await serviceCollection.updateOne(filter, service, options);
            res.send(result);
            console.log(result);
        })

        app.delete('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id:new ObjectId(id) };
            const result = await serviceCollection.deleteOne(query);
            res.send(result);
        })


        // save a book data in db

        app.post('/booked', async(req, res) => {
            const bookData = req.body
            
            const result = await bookingCollection.insertOne(bookData);
            res.send(result);
        })

        // get all book for a user by email from db

        app.get('/my-book/:email', async (req, res) => {
            // console.log(req.params.email);
            const email = req.params.email;
            const query = {email}
            const result = await bookingCollection.find(query).toArray();
            res.send(result);
        })

        // get all bid request from db for job owner

        app.get('/service-do/:email', async (req, res) => {
            // console.log(req.params.email);
            const email = req.params.email;
            const query = {'uEmail' : email}
            const result = await bookingCollection.find(query).toArray();
            res.send(result);
        })

        // update book status

        app.patch('/book/:id', async (req, res) => {
            const id = req.params.id;
            const status = req.body
            const query = { _id:new ObjectId(id)}
            const updateDoc = {
                $set: status,
            }
            const result = await bookingCollection.updateOne(query, updateDoc)
            res.send(result)
        })


        // get all service data from db for pagination

        app.get('/all-service', async(req, res) => {
            const size = parseInt(req.query.size);
            const page = parseInt(req.query.page)-1;
            // const filter = req.query.filter;
            const search = req.query.search;
            console.log(size, page);

            let query = {
                name: { $regex : search, $option: 'i' },
                
            }
            // if(filter) query.category = filter
            
            const result = await serviceCollection.find().skip(page * size).limit(size).toArray()
            res.send(result);
        })
        // get all service data count from db

        app.get('/service-count', async(req, res) => {
            // const filter = req.query.filter
            const search = req.query.search;
            let query = {
                name: { $regex : search, $option: 'i' },
                
            }
            // if(filter) query.category = filter

            const count = await serviceCollection.countDocuments()

            res.send({count});
        })



        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error

    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Hello from Home service....')
})

app.listen(port, () => console.log(`server is running on port:${port} `))

