const { User, Thought } = require("../models");


module.exports = {
  // Get all users from the database
  getUser(req, res) {
    User.find({})
      .then((users) => res.json(users)) // Send all users as a JSON response
      .catch((err) => res.status(500).json(err)); // If there's an error, send a 500 status with the error message
  },

  // Get one user by their ID, including their thoughts and friends
  getSingleUser(req, res) {
    User.findOne({ _id: req.params.userId })
      .populate("thoughts") // Include the user's thoughts
      .populate("friends") // Include the user's friends
      .select("-__v") // Do not include the __v field
      .then((user) =>
        !user
          ? res.status(404).json({ message: "User with this ID not found!" }) // If no user, send 404 status
          : res.json(user) // If user is found, send the user as a JSON response
      )
      .catch((err) => res.status(500).json(err)); 

  // Add a new user to the database
  createUser(req, res) {
    User.create(req.body)
      .then((user) => res.json(user)) // Send the new user as a JSON response
      .catch((err) => res.status(500).json(err)); 
  },

  // Update an existing user by their ID
  updateUser(req, res) {
    User.findOneAndUpdate(
      { _id: req.params.userId }, // Find the user by their ID
      { $set: req.body }, // Update the user with the data from the request body
      { runValidators: true, new: true } // Run validators and return the updated user
    )
      .then((user) =>
        !user
          ? res.status(404).json({ message: "User with this ID not found!" }) // If no user, send 404 status
          : res.json(user) // If user is found, send the updated user as a JSON response
      )
      .catch((err) => res.status(500).json(err)); 
  },

  // Delete a user by their ID and also delete their associated thoughts
  deleteUser(req, res) {
    User.findOneAndDelete({ _id: req.params.userId }) // Find and delete the user by their ID
      .then((user) =>
        !user
          ? res.status(404).json({ message: "User with this ID not found!" }) 
          : Thought.deleteMany({ _id: { $in: user.thoughts } }) // Delete all thoughts associated with the user
      )
      .then(() => res.json({ message: "User and user's thoughts have been deleted!" })) // Send a message that the user and their thoughts were deleted
      .catch((err) => res.status(500).json(err)); 
  },

  // Add a friend to the user's friend list
  addFriend(req, res) {
    User.findOneAndUpdate(
      { _id: req.params.userId }, // Find the user by their ID
      { $addToSet: { friends: req.params.friendId } }, // Add the friend's ID to the user's friends list
      { runValidators: true, new: true } // Run validators and return the updated user
    )
      .then((user) =>
        !user
          ? res.status(404).json({ message: "User with this ID not found!" }) // If no user, send 404 status
          : res.json(user) // If user is found, send the updated user as a JSON response
      )
      .catch((err) => res.status(500).json(err));
  },

  // Remove a friend from the user's friend list
  deleteFriend(req, res) {
    User.findOneAndUpdate(
      { _id: req.params.userId }, // Find the user by their ID
      { $pull: { friends: req.params.friendId } }, // Remove the friend's ID from the user's friends list
      { new: true } // Return the updated user
    )
      .then((user) =>
        !user
          ? res.status(404).json({ message: "User with this ID not found!" })
          : res.json(user) // If user is found, send the updated user as a JSON response
      )
      .catch((err) => res.status(500).json(err)); 
  },
};

