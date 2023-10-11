import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError, NotFoundError } from "./errors";

export interface ProfileDoc extends BaseDoc {
  owner: ObjectId;
  name: string; // if the user doesn't specifiy a name, this field will be an empty string
  bio: string; // if the user doesn't specifiy a bio, this field will be an empty string
  profileImg: string; // if the user doesn't specify a bio, this field will be a default image file
}

export default class ProfileConcept {
  public readonly profiles = new DocCollection<ProfileDoc>("profiles");

  async getProfile(userId: ObjectId) {
    const profile = await this.profiles.readOne({ owner: userId });
    if (profile === null) {
      throw new NotFoundError(`This user does not have a profile!`);
    }
    return profile;
  }

  async getAllProfiles() {
    return await this.profiles.readMany({});
  }

  async createProfile(userId: ObjectId, name: string = "", bio: string = "", profileImg: string = "default-image.jpg") {
    const existingProfile = await this.profiles.readOne({ owner: userId });
    if (existingProfile) {
      throw new NotAllowedError("User already has a profile.");
    }
    await this.profiles.createOne({ owner: userId, name: name, bio: bio, profileImg: profileImg });
    return await this.getProfile(userId);
  }

  async editName(userId: ObjectId, name: string) {
    this.sanitizeUpdate({ name });
    const profile = await this.getProfile(userId);
    await this.profiles.updateOne({ _id: profile._id }, { name });
    return { msg: "Profile name edited successfully!", profile: await this.getProfile(userId) };
  }

  async editBio(userId: ObjectId, bio: string) {
    this.sanitizeUpdate({ bio });
    const profile = await this.getProfile(userId);
    await this.profiles.updateOne({ _id: profile._id }, { bio });
    return { msg: "Profile bio edited successfully!", profile: await this.getProfile(userId) };
  }

  async editProfileImg(userId: ObjectId, profileImg: string) {
    this.sanitizeUpdate({ profileImg });
    const profile = await this.getProfile(userId);
    await this.profiles.updateOne({ _id: profile._id }, { profileImg });
    return { msg: "Profile image edited successfully!", profile: await this.getProfile(userId) };
  }

  private sanitizeUpdate(update: Partial<ProfileDoc>) {
    // Make sure the update cannot change the user.
    const allowedUpdates = ["name", "bio", "profileImg"];
    for (const key in update) {
      if (!allowedUpdates.includes(key)) {
        throw new NotAllowedError(`Cannot update '${key}' field!`);
      }
    }
  }
}
