import { ObjectId } from "mongodb";

import { Router, getExpressRouter } from "./framework/router";

import { Friend, Post, User, WebSession } from "./app";
import { PostDoc, PostOptions } from "./concepts/post";
import { UserDoc } from "./concepts/user";
import { WebSessionDoc } from "./concepts/websession";
import Responses from "./responses";

class Routes {
  @Router.get("/session")
  async getSessionUser(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    return await User.getUserById(user);
  }

  @Router.get("/users")
  async getUsers() {
    return await User.getUsers();
  }

  @Router.get("/users/:username")
  async getUser(username: string) {
    return await User.getUserByUsername(username);
  }

  @Router.post("/users")
  async createUser(session: WebSessionDoc, username: string, password: string) {
    WebSession.isLoggedOut(session);
    return await User.create(username, password);
  }

  @Router.patch("/users")
  async updateUser(session: WebSessionDoc, update: Partial<UserDoc>) {
    const user = WebSession.getUser(session);
    return await User.update(user, update);
  }

  @Router.delete("/users")
  async deleteUser(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    WebSession.end(session);
    return await User.delete(user);
  }

  @Router.post("/login")
  async logIn(session: WebSessionDoc, username: string, password: string) {
    const u = await User.authenticate(username, password);
    WebSession.start(session, u._id);
    return { msg: "Logged in!" };
  }

  @Router.post("/logout")
  async logOut(session: WebSessionDoc) {
    WebSession.end(session);
    return { msg: "Logged out!" };
  }

  @Router.get("/posts")
  async getPosts(author?: string) {
    let posts;
    if (author) {
      const id = (await User.getUserByUsername(author))._id;
      posts = await Post.getByAuthor(id);
    } else {
      posts = await Post.getPosts({});
    }
    return Responses.posts(posts);
  }

  @Router.post("/posts")
  async createPost(session: WebSessionDoc, content: string, options?: PostOptions) {
    const user = WebSession.getUser(session);
    const created = await Post.create(user, content, options);
    return { msg: created.msg, post: await Responses.post(created.post) };
  }

  @Router.patch("/posts/:_id")
  async updatePost(session: WebSessionDoc, _id: ObjectId, update: Partial<PostDoc>) {
    const user = WebSession.getUser(session);
    await Post.isAuthor(user, _id);
    return await Post.update(_id, update);
  }

  @Router.delete("/posts/:_id")
  async deletePost(session: WebSessionDoc, _id: ObjectId) {
    const user = WebSession.getUser(session);
    await Post.isAuthor(user, _id);
    return Post.delete(_id);
  }

  @Router.get("/friends")
  async getFriends(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    return await User.idsToUsernames(await Friend.getFriends(user));
  }

  @Router.delete("/friends/:friend")
  async removeFriend(session: WebSessionDoc, friend: string) {
    const user = WebSession.getUser(session);
    const friendId = (await User.getUserByUsername(friend))._id;
    return await Friend.removeFriend(user, friendId);
  }

  @Router.get("/friend/requests")
  async getRequests(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    return await Responses.friendRequests(await Friend.getRequests(user));
  }

  @Router.post("/friend/requests/:to")
  async sendFriendRequest(session: WebSessionDoc, to: string) {
    const user = WebSession.getUser(session);
    const toId = (await User.getUserByUsername(to))._id;
    return await Friend.sendRequest(user, toId);
  }

  @Router.delete("/friend/requests/:to")
  async removeFriendRequest(session: WebSessionDoc, to: string) {
    const user = WebSession.getUser(session);
    const toId = (await User.getUserByUsername(to))._id;
    return await Friend.removeRequest(user, toId);
  }

  @Router.put("/friend/accept/:from")
  async acceptFriendRequest(session: WebSessionDoc, from: string) {
    const user = WebSession.getUser(session);
    const fromId = (await User.getUserByUsername(from))._id;
    return await Friend.acceptRequest(fromId, user);
  }

  @Router.put("/friend/reject/:from")
  async rejectFriendRequest(session: WebSessionDoc, from: string) {
    const user = WebSession.getUser(session);
    const fromId = (await User.getUserByUsername(from))._id;
    return await Friend.rejectRequest(fromId, user);
  }

  // // API FOR ENTRY CONCEPT
  // @Router.get("/api/prompts/random")
  // async fetchRandomPrompt() {
  //   // Fetch a random journal prompt from a separate database or source.
  // }

  // @Router.post("/api/entries")
  // async addEntry(session: WebSessionDoc, prompt: string, response: string) {
  //   // Create a new journal entry with the provided prompt and response for the authenticated user.
  // }

  // @Router.get("/api/entries/:authorId")
  // async getEntryByAuthor(authorId: ObjectId) {
  //   // Retrieve journal entries by a specific author (user) identified by 'authorId'.
  // }

  // @Router.put("/api/entries/:entryId")
  // async editEntry(entryId: ObjectId, response: string) {
  //   // Update the response of a specific journal entry identified by 'entryId'.
  // }

  // @Router.delete("/api/entries/:entryId")
  // async deleteEntry(entryId: ObjectId) {
  //   // Delete a specific journal entry identified by 'entryId'.
  // }

  // // API FOR MESSAGE CONCEPT
  // @Router.post("/api/messages")
  // async sendMessage(senderId: ObjectId, recipientId: ObjectId, content: Entry) {
  //   // API route to send a message with sender, recipient, and content.
  // }

  // @Router.get("/api/messages/sent/:senderId")
  // async getSentMessages(senderId: ObjectId) {
  //   // API route to get messages sent by a specific user (sender).
  // }

  // @Router.get("/api/messages/received/:recipientId")
  // async getReceivedMessages(recipientId: ObjectId) {
  //   // API route to get messages received by a specific user (recipient).
  // }

  // // API FOR VISIBILITY CONCEPT
  // @Router.get("/api/visibility/:userId/content")
  // async getVisibleContent(userId: User) {
  //   // API route to get all content visible to the user identified by 'userId'.
  // }

  // @Router.post("/api/visibility/:userId/make-visible")
  // async makeVisible(userId: User, content: Entry) {
  //   // API route to make a piece of content visible to the user identified by 'userId'.
  // }

  // @Router.post("/api/visibility/:userId/make-invisible")
  // async makeInvisible(userId: User, content: Entry) {
  //   // API route to make a piece of content invisible to the user identified by 'userId'.
  // }

  // // API FOR PROFILE CONCEPT
  // @Router.get("/api/profiles/:userId")
  // async getProfile(userId: User) {
  //   // API route to get the profile of the user identified by 'userId'.
  // }

  // @Router.get("/api/profiles/:userId/info/all")
  // async getAllInfo(userId: User) {
  //   // API route to get all public and private info from the profile of the user identified by 'userId'.
  // }

  // @Router.get("/api/profiles/:userId/info/private")
  // async getPrivateInfo(userId: User) {
  //   // API route to get private info from the profile of the user identified by 'userId'.
  // }

  // @Router.get("/api/profiles/:userId/info/public")
  // async getPublicInfo(userId: User) {
  //   // API route to get public info from the profile of the user identified by 'userId'.
  // }

  // @Router.post("/api/profiles/create/:userId")
  // async createProfile(userId: User) {
  //   // API route to create a new profile for the user identified by 'userId'.
  // }

  // @Router.post("/api/profiles/:userId/info/add/:public")
  // async addInfo(userId: User, info: Info, public: boolean) {
  //   // API route to add information (public or private) to the profile of the user identified by 'userId'.
  // }

  // @Router.post("/api/profiles/:userId/info/remove/:public")
  // async removeInfo(userId: User, info: Info, public: boolean) {
  //   // API route to remove information (public or private) from the profile of the user identified by 'userId'.
  // }

  // @Router.post("/api/profiles/:userId/info/update/:public")
  // async updateInfo(userId: User, infoName: string, infoValue: any, public: boolean) {
  //   // API route to update information (public or private) in the profile of the user identified by 'userId'.
  // }

  // @Router.post("/api/profiles/:userId/info/make-private")
  // async makeInfoPrivate(userId: User, infoName: string, infoValue: any) {
  //   // API route to make information private in the profile of the user identified by 'userId'.
  // }

  // @Router.post("/api/profiles/:userId/info/make-public")
  // async makeInfoPublic(userId: User, infoName: string, infoValue: any) {
  //   // API route to make information public in the profile of the user identified by 'userId'.
  // }
}

export default getExpressRouter(new Routes());
