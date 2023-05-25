//Requiring Part

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");
const _ = require('lodash');
require("dotenv").config();

//requiring part ends here

//Body and Declaration part

var app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static("Public"));

//body and Declaration Part Ends Here

//Connecting to MongoDB

const uri = process.env.uri;
mongoose.connect(uri);

//Schema

const newItemsSchema = new mongoose.Schema({
  name: String,
  isCompleted: {
    type: Boolean,
    default: false,
  },
});

const listSchema = {
  name: String,
  items: [newItemsSchema],
};

//Schema Ends here

//Model

const newItem = mongoose.model("newItem", newItemsSchema);

const List = mongoose.model("List", listSchema);

//Model Ends here

//Default Items

const item1 = new newItem({
  name: "This is Default Statements",
});
const item2 = new newItem({
  name: "Type the task and press add button to add",
});
const item3 = new newItem({
  name: "press checkmark for completed and press completed button",
});
const item4 = new newItem({
  name: "press clearall to remove completed tasks",
});
const defaultItem = [item1, item2, item3, item4];

//Default Items Ends

//Post Method for Root route

app.post("/", (req, res) => {
  const addItem = req.body.listTodo;
  const listName = req.body.list;
  const addnewItem = new newItem({
    name: addItem,
  });

  if (listName === "Things to do") {
    addnewItem
      .save()
      .then((newAdd) => {
        console.log("Added Sucessfully");
        res.redirect("/");
      })
      .catch((error) => {
        console.error(error);
        res.redirect("/");
      });
  } else {
    List.findOne({ name: listName })
      .then((foundList) => {
        foundList.items.push(addnewItem);
        foundList.save();
        res.redirect("/" + listName);
      })
      .catch((error) => {
        console.error(error);
      });
  }
});

//Post Method for Root route ends

//Post method for remove route

app.post("/remove", (req, res) => {
  const listNametitle = req.body.listNametitle;
  let filter = { _id: req.body.check };
  const update = { isCompleted: true };

  if (listNametitle === "Things to do") {
    newItem
      .updateOne(filter, update)
      .then((complete) => {
        console.log("Removed and marked as completed");
        res.redirect("/");
      })
      .catch((error) => {
        console.error(error);
        res.redirect("/");
      });
  } else {
    List.findOne({ name: listNametitle })
      .then((foundItem) => {
        const item = foundItem.items.id(req.body.check);
        item.isCompleted = true;
        foundItem.save();
        res.redirect("/" + listNametitle);
      })
      .catch((error) => {
        console.error(error);
      });
  }
});

//Post method for remove route ends

//Post method for removeall route

app.post("/removeall", (req, res) => {
  const deleteFilter = req.body.completedCheck;
  const listName = req.body.listName;

  if (listName === "Things to do") {
    newItem
      .findByIdAndRemove(deleteFilter)
      .then((deleteCompleted) => {
        console.log("Deleted Sucessfully");
        res.redirect("/");
      })
      .catch((error) => {
        console.error(error);
        res.redirect("/");
      });
  } else {
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: deleteFilter } } }
    )
      .then((foundList) => {
        res.redirect("/" + listName);
      })
      .catch((error) => {
        console.error(error);
      });
  }
});

//Post method for removeall route ends here

//Get method for root route

app.get("/", (req, res) => {
  let day = date();
  newItem
    .find({})
    .then((newItems) => {
      if (newItems.length == 0) {
        newItem
          .insertMany(defaultItem)
          .then((defaultThings) => {
            console.log("Default Items Inserted Successfully");
            res.redirect("/");
          })
          .catch((error) => {
            console.error(error);
            res.redirect("/");
          });
      } else {
        res.render("list", {
          kindOfday: day,
          item: newItems,
          listTitle: "Things to do",
        });
      }
    })
    .catch((error) => {
      console.error(error);
      res.redirect("/");
    });
});

//Get method for root route ends here

//dynamic route

app.get("/:customeListName", (req, res) => {
  let day = date();
  const customeListName = _.capitalize(req.params.customeListName);

  List.findOne({ name: customeListName })
    .then((foundList) => {
      if (!foundList) {
        const list = new List({
          name: customeListName,
          items: defaultItem,
        });
        list
          .save()
          .then((result) => {
            res.redirect("/" + customeListName);
          })
          .catch((error) => {
            console.error(error);
          });
      } else {
        res.render("list", {
          kindOfday: day,
          item: foundList.items,
          listTitle: foundList.name,
        });
      }
    })
    .catch((error) => {
      console.error(error);
    });
});

//Dynamic route ends here

//Server start

app.listen(3000, () => {
  console.log("server is running on port 3000");
});