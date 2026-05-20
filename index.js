const express = require('express')
const dotenv = require('dotenv')
const app = express()
const cors = require("cors")
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
dotenv.config()

const PORT = process.env.PORT
const uri = process.env.MONGODB_URI;

app.use(cors())
app.use(express.json())

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


 app.get('/myidea', async (req, res) => {
     try {
         const email = req.query.email; 
        
         if (!email) {
             return res.status(400).json({ message: "Email query parameter is required" });
         }

         const result = await addIdeaCollection.find({ email: email }).toArray();
         res.json(result);
     } catch (error) {
         console.error("Error fetching my ideas:", error);
         res.status(500).json({ message: "Internal Server Error" });
     }
 });


 app.post('/my-interactions', async (req, res) => {
    try {
        const commentData = req.body;
        console.log("comment", commentData);

        const result = await commentsCollection.insertOne(commentData);
        
        res.json({ _id: result.insertedId, ...commentData });

    } catch (error) {
        console.error("Error saving comment:", error);
        res.status(500).send({ message: "Internal Server Error" });
    }
});



async function run() {
  try {
    await client.connect();

    const db = client.db("ideaVault")
    const addIdeaCollection = db.collection("addIdea")
    const ideasCollection = db.collection("ideas")
    const commentsCollection = db.collection('comments');









    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Keep connection alive
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send("server is Okay")
})

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})