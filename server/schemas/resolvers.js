const { Book, User } = require('../models');
const { signToken } = require('../utils/auth');
const { AuthenticationError } = require('apollo-server-express');

const resolvers = {
    Query: {
        
        me: async (parent, {_id}) => {
            const params = _id ? { _id } : {};
            return User.find(params);
        },
        
    },
    Mutation: {
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email, password });

            if (!user) {
                throw new AuthenticationError('Incorrect email or password');
            }

            const correctPw = await user.isCorrectPassword(password);

            if (!correctPw) {
                throw new AuthenticationError('Incorrect email or password');
            }

            const token = signToken(user);
            return { token, user }
        },
        createUser: async (parent, args) => {
            const user = await User.create(args);
            return user;
        },
        saveBook: async (parent, { user, body }) => {
            const updatedUser = await User.findOneAndUpdate(
                { _id: user._id },
                { $addToSet: { savedBooks: body } },
                { new: true, runValidators: true }
            );
            return updatedUser;
        },
        deleteBook: async (parent, { user, params }) => {
            const updatedUser = await User.findOneAndDelete(
                { _id: user._id },
                { $pull: { savedBooks: { bookId: params.bookId } } },
                { new: true }
            );
            return updatedUser;
        }     
    },
};

module.exports = resolvers;