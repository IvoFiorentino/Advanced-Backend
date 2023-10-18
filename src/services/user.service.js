import { usersManager } from '../DATA/DAOs/usersMongo.dao.js';

class UserService {
  async createUser(user) {
    try {
      const newUser = await usersManager.create(user);
      return newUser;
    } catch (error) {
      throw new Error('Error creating user');
    }
  }

  async findUserByUsername(username) {
    try {
      const user = await usersManager.findUser(username);
      return user;
    } catch (error) {
      throw new Error('Error finding user');
    }
  }
}

export const userService = new UserService();