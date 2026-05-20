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


app.get('/user-comments', async (req, res) => {
    try {
        const email = req.query.email; 
        
        if (!email) {
            return res.status(400).json({ message: "Email query parameter is required" });
        }

        const result = await commentsCollection.find({
            $or: [
                { userEmail: email },
                { email: email }
            ]
        }).sort({ _id: -1 }).toArray();
        
        res.json(result);
    } catch (error) {
        console.error("Error fetching user comments:", error);
        res.status(500).json({ message: "Error fetching user comments" });
    }
});


app.get('/comments/:ideaId', async (req, res) => {
    try {
        const { ideaId } = req.params; 
        
        const result = await commentsCollection.find({ ideaId: ideaId }).toArray();
        
        res.json(result);
    } catch (error) {
        console.error("Error fetching comments:", error);
        res.status(500).json({ message: "Error fetching comments" });
    }
});


app.delete('/comments/:id', async (req, res) => {
   try {
        const { id } = req.params; 
        const result = await commentsCollection.deleteOne({ _id: new ObjectId(id) });
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: "Error deleting comment" });
    }
       
});


app.delete('/ideas/:id', async (req, res) => {
    try {
        const { id } = req.params; 
        const result = await addIdeaCollection.deleteOne({ _id: new ObjectId(id) });
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: "Error deleting idea" });
    }
});


app.put('/ideas/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updatedData = req.body;
        
        delete updatedData._id; 

        const result = await addIdeaCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updatedData }
        );
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: "Error updating idea" });
    }
});



app.patch('/comments/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { text } = req.body; 

        if (!text || !text.trim()) {
            return res.status(400).json({ message: "Text is required" });
        }

        const result = await commentsCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: { text: text } }
        );

        if (result.matchedCount === 1) {
            res.json({ success: true, message: "Comment updated successfully" });
        } else {
            res.status(404).json({ success: false, message: "Comment not found" });
        }
    } catch (error) {
        console.error("Error updating comment:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});



app.get('/trending-ideas', async (req, res) => {
    try {
        const userIdeas = await addIdeaCollection.find().sort({ _id: -1 }).toArray();
        const fakeIdeas = await ideasCollection.find().toArray();
        
        const combinedIdeas = [...userIdeas, ...fakeIdeas];

        const trendingResult = combinedIdeas.slice(-6).reverse(); 
        
        res.send(trendingResult);
    } catch (error) {
        res.status(500).send({ message: "Error fetching trending ideas" });
    }
});


app.get('/all-ideas', async (req, res) => {
    try {
        const userEmail = req.query.email;

        const addIdeaData = await addIdeaCollection.find().sort({ _id: -1 }).toArray();
        const fakeIdeasData = await ideasCollection.find().toArray();
        
        const allData = [...addIdeaData, ...fakeIdeasData];

        const filteredIdeas = allData.filter(idea => {
            const isManualFixedData = idea.isManual === true;
            
            const isCurrentUserIdea = userEmail && (idea.userEmail === userEmail || idea.email === userEmail);
            
            const isOldDatabaseData = !idea.hasOwnProperty('isManual');

            return isManualFixedData || isCurrentUserIdea || isOldDatabaseData;
        });

        res.json(filteredIdeas);
    } catch (error) {
        console.error("Error in all-ideas:", error);
        res.status(500).json([]);
    }
});


    app.post('/addidea', async (req, res) => {
        const addIdeaData = req.body
         
        if (!addIdeaData.email) {
        return res.status(400).json({ message: "User email is required!" });
    }

        const result = await addIdeaCollection.insertOne(addIdeaData)
        res.json(result)
    })



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