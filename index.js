const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app=express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fbvkkp8.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    const addsbookcollection = client.db('addbookDb').collection('books');

    app.get('/addbook',async(req,res)=>{
        const category = req.query.category;
        let query = {};
        if (category) {
            query = { category: category };
        }
        const cursor= addsbookcollection.find(query);
        const result = await cursor.toArray();
        res.send(result)
    })

    app.post('/addbook',async(req,res)=>{
        const booksData = req.body;
        console.log(booksData);
        const result =await addsbookcollection.insertOne(booksData);
        
        res.send(result);
    })

    app.get('/addbook/:id',async(req,res)=>{
        const id =req.params.id;
        const query={_id : new ObjectId(id)}
        const result = await addsbookcollection.findOne(query)
        res.send(result);

     })
     
    app.put(`/addbook/:id`,async(req,res)=>{
        const id =req.params.id;
        const filter= {_id:new ObjectId(id)}
        const options = {upsert : true};
        const UpdaetedData= req.body;
        const Updaeted ={
            $set:{
                image:UpdaetedData.image,
                name:UpdaetedData.name,
                author:UpdaetedData.author,
                category:UpdaetedData.category,
                rating:UpdaetedData.rating,
                
            }
        }
        const result = await addsbookcollection.updateOne(filter,Updaeted,options);
        res.send(result);
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/',(req,res)=>{
    res.send('the library server is running')
})

app.listen(port,()=>{
    console.log(`the library is running port : ${port}`)
})