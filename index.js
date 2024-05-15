const express = require('express');
const cors = require('cors');
const jwt =require('jsonwebtoken')
const cookiePerser = require('cookie-parser');
require('dotenv').config();
const app=express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;


app.use(cors({
    origin:['https://assainment-eleven-library.web.app',],
    credentials: true
}));
app.use(express.json());
app.use(cookiePerser());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fbvkkp8.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const logger =async(req,res,next)=>{

    // console.log('called:', req.host,req.originalUrl);
    next();
}

const verifyToken = async(req,res,next)=>{
    const token=req?.cookies?.token;
    // console.log(token)
if(!token){
    return res.status(401).send({massage: 'not authoraize'})
}
jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,(err,decoded)=>{
    if(err){
        console.log(err)
        return res.status(401).send({massage:'unauthoris'})
    }
    // console.log('value in the token',decoded)
    req.user=decoded;
    next();
})
    
}

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    const addsbookcollection = client.db('addbookDb').collection('books');
    const Borrowbookcollection = client.db('addbookDb').collection('borrowbooks');
// token releted
    app.post('/jwt',logger,async(req,res)=>{
        const user = req.body;
        console.log(user);
        const token = jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{expiresIn:'1h'})
        res
        .cookie('token',token,{
            httpOnly:true,
            secure:true,
            sameSite: 'none'
        })
        .send({succes: true})
    })

    // service releted
    app.get('/addbook',logger,verifyToken,async(req,res)=>{
        const category = req.query?.category;
        // console.log('tok tok token',req.cookies.token);
       
        let query = {};
        if (category) {
            query = { category: category };
        }
        const cursor= addsbookcollection.find(query);
        const result = await cursor.toArray();
        res.send(result)
    })

    app.get('/borrow',async(req,res)=>{
        const cursor= Borrowbookcollection.find();
        const result = await cursor.toArray();
        res.send(result)
    })

    app.post('/borrow',async(req,res)=>{
        const newborrowbooks = req.body;
        const result =await Borrowbookcollection.insertOne(newborrowbooks);
        
        res.send(result);
    })

    app.post('/addbook',logger,async(req,res)=>{
        
        const booksData = req.body;
        // console.log(booksData);
        const result =await addsbookcollection.insertOne(booksData);
        
        res.send(result);
    })

    app.get('/addbook/:id',logger,async(req,res)=>{
        const id =req.params.id;
        const query={_id : new ObjectId(id)}
        const result = await addsbookcollection.findOne(query)
        res.send(result);

     })

    app.put(`/addbook/:id`,logger,async(req,res)=>{
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

    app.delete('/borrow/:id',logger,async(req,res)=>{
        const id =req.params.id;
        const query={_id:new ObjectId(id)}
        const result = await Borrowbookcollection.deleteOne(query);
        res.send(result)
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