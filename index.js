const express = require('express');
const dotenv = require('dotenv');
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { createLocalJWKSet } = require('jose-cjs');
const { createRemoteJWKSet, jwtVerify } = require('jose-cjs');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
const uri = process.env.MONGODB_URI;

app.use(cors());
app.use(express.json());

const client = new MongoClient(uri, {
    serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true }
});

let addIdeaCollection, ideasCollection, commentsCollection;

async function run() {
    try {
        await client.connect();
        const db = client.db("ideaVault");
        
        addIdeaCollection = db.collection("addIdea");
        ideasCollection = db.collection("ideas");
        commentsCollection = db.collection('comments');

        console.log("Connected to MongoDB!");
    } catch (error) {
        console.error("Connection Error:", error);
    }
}
run();


const verifyToken = async (req, res, next) => {
    
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
    console.log("new", token);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log("Null");
        req.user = null; 
        return next(); 
    }

    req.user = { email: "verified-user" }; 

        try{
           const {payload} = await jwtVerify(token, JWKS)
           console.log(payload)
 next();
          
    } catch(error) {
       return res.status(403).json({ message: "Forbidden" });
      
    }

//  next();
};


app.get('/myidea', verifyToken,  async (req, res) => {
    try {
        const email = req.query.email;
        if (!email) return res.status(400).json({ message: "Email is required" });
        const result = await addIdeaCollection.find({ email: email }).toArray();
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
});

app.post('/my-interactions', verifyToken,  async (req, res) => {
    try {
        const result = await commentsCollection.insertOne(req.body);
        res.json({ _id: result.insertedId, ...req.body });
    } catch (error) {
        res.status(500).send({ message: "Internal Server Error" });
    }
});

app.get('/user-comments', async (req, res) => {
    try {
        const email = req.query.email;
        const result = await commentsCollection.find({
            $or: [{ userEmail: email }, { email: email }]
        }).sort({ _id: -1 }).toArray();
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: "Error" });
    }
});

app.get('/comments/:ideaId', async (req, res) => {
    const result = await commentsCollection.find({ ideaId: req.params.ideaId }).toArray();
    res.json(result);
});

app.delete('/comments/:id', verifyToken , async (req, res) => {
    const result = await commentsCollection.deleteOne({ _id: new ObjectId(req.params.id) });
    res.json(result);
});

app.delete('/ideas/:id', verifyToken ,  async (req, res) => {
    const result = await addIdeaCollection.deleteOne({ _id: new ObjectId(req.params.id) });
    res.json(result);
});

app.put('/ideas/:id', async (req, res) => {
    const { id } = req.params;
    const updatedData = req.body;
    delete updatedData._id;
    const result = await addIdeaCollection.updateOne({ _id: new ObjectId(id) }, { $set: updatedData });
    res.json(result);
});

app.patch('/comments/:id', async (req, res) => {
    const result = await commentsCollection.updateOne(
        { _id: new ObjectId(req.params.id) },
        { $set: { text: req.body.text } }
    );
    res.json(result);
});

app.get('/trending-ideas', async (req, res) => {
    const userIdeas = await addIdeaCollection.find().sort({ _id: -1 }).toArray();
    const fakeIdeas = await ideasCollection.find().toArray();
    res.json([...userIdeas, ...fakeIdeas].slice(-6).reverse());
});


const JWKS = createRemoteJWKSet(new URL("http://localhost:3000/api/auth/jwks"));


app.get('/all-ideas', verifyToken, async (req, res) => {


    try {
        const addIdeaData = await addIdeaCollection.find().toArray();
        const fakeIdeasData = await ideasCollection.find().toArray();
        
        const sortedUserIdeas = addIdeaData.sort((a, b) => {
            return new ObjectId(b._id).getTimestamp() - new ObjectId(a._id).getTimestamp();
        });

        const allData = [...sortedUserIdeas, ...fakeIdeasData];
        res.json(allData);
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
});


app.post('/addidea', verifyToken , async (req, res) => {
    if (!req.body.email) return res.status(400).json({ message: "Email required" });
    const result = await addIdeaCollection.insertOne(req.body);
    res.json(result);
});

app.get('/', (req, res) => res.send("Server is running"));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));