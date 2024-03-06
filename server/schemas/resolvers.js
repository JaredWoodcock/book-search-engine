const { User, Book } = require('./models');
const { signToken } = require('../utils/auth');

const resolvers = {
  Query: {
    me: async (_, __, context) => {
      if (context.user) {
        return await User.findById(context.user._id).populate('savedBooks');
      }
      throw new Error('You are not logged in');
    }
  },
  
  Mutation: {
    login: async (_, { email, password }) => {
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error('Incorrect username or password');
      }

      const correctPassword = await user.isCorrectPassword(password);
      if (!correctPassword) {
        throw new Error('Incorrect username or password');
      }

      const token = signToken(user);
      return { token, user };
    },
    
    addUser: async (_, { username, email, password }) => {
      const user = await User.create({ username, email, password });
      const token = signToken(user);
      return { token, user };
    },
    
    saveBook: async (_, { bookData }, context) => {
      if (context.user) {
        const updatedUser = await User.findByIdAndUpdate(
          context.user._id,
          { $addToSet: { savedBooks: bookData } },
          { new: true }
        ).populate('savedBooks');
        return updatedUser;
      }
      throw new Error('You need to be logged in to save books');
    },
    
    removeBook: async (_, { bookId }, context) => {
      if (context.user) {
        const updatedUser = await User.findByIdAndUpdate(
          context.user._id,
          { $pull: { savedBooks: { bookId: bookId } } },
          { new: true }
        ).populate('savedBooks');
        return updatedUser;
      }
      throw new Error('You need to be logged in to remove books');
    }
  }
};

module.exports = resolvers;