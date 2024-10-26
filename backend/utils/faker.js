import { faker } from "@faker-js/faker";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const createRandomUser = async () => {
  const user = await prisma.user.create({
    data: {
      id: faker.string.uuid(),
      username: faker.internet.userName(),
      password: faker.internet.password(),
      name: faker.internet.displayName(),
      bio: faker.lorem.sentence(),
      profileImage: faker.image.avatar(),
    },
  });

  return user;
};

const createRandomPost = async (userId) => {
  const post = await prisma.post.create({
    data: {
      id: faker.string.uuid(),
      content: faker.lorem.paragraph(),
      author_id: userId,
      img_url: faker.image.url(),
    },
  });

  return post;
};

const createRandomLike = async (userId, postId) => {
  const like = await prisma.like.create({
    data: {
      author_id: userId,
      post_id: postId,
    },
  });

  return like;
};

const createRandomComment = async (userId, postId) => {
  const comment = await prisma.comment.create({
    data: {
      content: faker.lorem.sentence(),
      author_id: userId,
      likes: {
        create: [
          {
            author_id: userId,
          },
        ],
      },
    },
  });

  return comment;
};

const createRandomFollowing = async (followerId, followingId) => {
  const following = await prisma.following.create({
    data: {
      follower_id: followerId,
      following_id: followingId,
    },
  });

  return following;
};

const seedUsers = async () => {
  for (let i = 0; i < 10; i++) {
    const user = await createRandomUser();
    const post = await createRandomPost(user.id);

    for (let j = 0; j < 3; j++) {
      await createRandomLike(user.id, post.id);
      await createRandomComment(user.id, post.id);
      await createRandomFollowing(
        "9c2b74c8-8496-4562-8ab7-896aa7e3f6b8",
        user.id
      );
    }
  }
};

seedUsers()
  .then(() => {
    console.log("Seeding complete");
  })
  .catch((error) => {
    console.error("Error seeding data:", error);
  })
  .finally(() => {
    prisma.$disconnect();
  });
