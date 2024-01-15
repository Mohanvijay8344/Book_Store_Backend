import mongoose from "mongoose";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { MongoClient, ObjectId } from "mongodb";

dotenv.config();

const app = express();
app.use(cors("*"));
app.use(express.json());

connect();

app.get("/", (req, res) => {
  res.send("Hello World!");
});

//mongodb connection
async function connect() {
  const client = new MongoClient(process.env.MONGO_URL);
  await client.connect();
  console.log("Mongodb connected successfully...!!!");

  const collections = client.db("Books_Collection").collection("Books");

  //create a collection of books
  app.post("/upload-book", async (req, res) => {
    const data = req.body;
    const result = await collections.insertOne(data);
    res.send(result);
  });

  //get all books from database
  app.get("/all-books", async (req, res) => {
    const books = await collections.find().toArray();
    res.send(books);
  });


  //get books by id
  app.get("/book/:id", async (req, res) => {
    const id = req.params.id;
    const book = await collections.findOne({ _id: new ObjectId(id) });
    if(book){
        res.send(book);
    } else {
        res.send("Document not found");
    }
  })

  //update books by id
  app.patch("/edit/:id", async (req, res) => {
    const id = req.params.id;
    const data = req.body;
  
    try {
      const result = await collections.updateOne(
        { _id: new ObjectId(id) },
        { $set: data }
      );
  
      if (result.modifiedCount > 0) {
        // Send a JSON response with a success message and result
        res.status(200).json({ message: "Updated Successfully", result });
      } else {
        res.status(404).json({ message: "No document found to update" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  //delete book by id
  app.delete("/book/delete/:id", async (req, res) => {
    const id = req.params.id;
  
    try { 
      const result = await collections.deleteOne({ _id: new ObjectId(id) });
  
      if (result.deletedCount > 0) {
        res.status(200).json({ message: "Deleted Successfully", result });
      } else {
        res.status(404).json({ message: "No document found to delete" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  //filter data by category
  app.get("/all-books", async (req, res) => {
    try {
      let query = {};
      if (req.query?.category) {
        query = { category: req.query.category };
      }
      const books = await collections.find(query).toArray();
  
      res.status(200).json(books);
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  });
}

app.listen(process.env.PORT, (req, res) => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
