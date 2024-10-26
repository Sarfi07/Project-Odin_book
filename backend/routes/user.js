import express from "express";
import prisma from "../utils/prismaClient.js";
import asyncHandler from "express-async-handler";
import multer from "multer";
import { storage } from "../config/cloudinary.js";
import bcrypt from "bcrypt";

const router = express.Router();
const upload = multer({ storage });

// all info should about the user shoule be sent by the index route
router.get("/", async (req, res) => {
  try {
    const user = await prisma.user.findFirst({
      where: {
        id: req.user.id,
      },
      select: {
        id: true,
        profileImage: true,
        bio: true,
        name: true,
        username: true,
        _count: {
          select: {
            followers: true,
            followings: true,
          },
        },
      },
    });

    return res.json({ user });
  } catch (err) {
    console.error("Db error");
    return res.json({ message: "db error", err });
  }
});

router.put("/update", async (req, res) => {
  try {
    // todo
    const { id, name, username, bio } = req.body;

    if (id !== req.user.id)
      return res.status(401).json({ message: "Scrutiny Failed" });

    const usernameExists = await prisma.user.findFirst({
      where: {
        username,
        NOT: {
          id: req.user.id,
        },
      }, // and id is not equal to req.user.id
    });

    if (!usernameExists) {
      await prisma.user.update({
        where: {
          id: req.user.id,
        },
        data: {
          name,
          bio,
          username,
        },
      });

      res.json({ message: "Updated Successfully" });
    } else {
      return res.status(409).json({ message: "Username already exists" });
    }
  } catch (err) {
    return res.json({ err });
  }
});
router.put("/update/password", async (req, res) => {
  try {
    // todo: a secure way to authenticate and update the password
    const { oldPassword, newPassword } = req.body;
    const match = bcrypt.compare(req.user.password, oldPassword);

    const user = await prisma.user.findFirst({
      where: {
        id: req.user.id,
      },
    });

    if (match) {
      const newHashedPassword = await bcrypt.hash(newPassword, 10);
      await prisma.user.update({
        where: {
          id: req.user.id,
        },
        data: {
          password: newHashedPassword,
        },
      });

      return res.json({ message: "Password updated successfully" });
    }

    return res
      .status(409)
      .json({ message: "Password didn't matched with the database" });
  } catch (err) {
    return res.status(500).json({ err });
  }
});
router.put(
  "/update/profileImage",
  upload.single("profileImage"),
  async (req, res) => {
    try {
      console.log("reached");
      const img_url = req.file.path;
      console.log(img_url);

      const updatedUser = await prisma.user.update({
        where: {
          id: req.user.id,
        },
        data: {
          profileImage: img_url,
        },
      });

      return res.json({
        message: "Profile Image Updated",
        updatedUser,
      });
    } catch (err) {
      return res.status(500).json({ err });
    }
  }
);

// posts by the user and other users that current user follows
router.get(
  "/posts",
  asyncHandler(async (req, res) => {
    try {
      const userId = req.user.id;
      const followings = await prisma.following.findMany({
        where: {
          follower_id: req.user.id,
        },
        select: {
          following_id: true,
        },
      });

      const followingIds = followings.map((f) => f.following_id);
      // get all posts by the user or followings
      let posts = await prisma.post.findMany({
        where: {
          author_id: {
            in: [...followingIds, req.user.id],
          },
        },
        include: {
          author: {
            select: {
              name: true,
              profileImage: true,
              username: true,
            },
          },
          likes: {
            select: {
              author_id: true,
            },
          },
          _count: {
            select: {
              likes: true,
              comments: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc", // sorting by newest posts
        },
      });

      posts = posts.map((post) => ({
        ...post,
        isLikedByUser: post.likes.some((like) => like.author_id === userId),
      }));

      return res.json({ posts, success: true });
    } catch (err) {
      console.log("dbError: ", err);
      return res.json({ success: false, err });
    }
  })
);

router.post("/posts/create", upload.single("image"), async (req, res) => {
  try {
    const { content } = req.body;
    const img_url = req.file?.path ?? null;
    console.log(content);
    // create a post
    console.log(content, img_url);
    const newPost = await prisma.post.create({
      data: {
        author_id: req.user.id,
        content,
        img_url,
      },
    });

    return res.json({ postId: newPost.id, message: "Posts created!" });
  } catch (err) {
    return res.status(500).json(err);
  }
});

router
  .route("/posts/:postId")
  .get(async (req, res) => {
    try {
      const { postId } = req.params;

      let post = await prisma.post.findFirst({
        where: {
          id: postId,
        },
        include: {
          author: {
            select: {
              name: true,
              profileImage: true,
              username: true,
              id: true,
            },
          },
          likes: {
            select: {
              author_id: true,
            },
          },
          _count: {
            select: {
              likes: true,
              comments: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc", // sorting by newest posts
        },
      });

      post = {
        ...post,
        isLikedByUser: post.likes.some(
          (like) => like.author_id === req.user.id
        ),
      };

      const comments = await prisma.comment.findMany({
        where: {
          post_id: postId,
        },
        include: {
          author: {
            select: {
              name: true,
              profileImage: true,
              id: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return res.json({ post, comments, currentUserId: req.user.id });
    } catch (err) {
      return res.json(err);
    }
  })
  .put(upload.single("image"), async (req, res) => {
    // check is current user is author and then allow any modification
    try {
      const { postId } = req.params;
      const post = await prisma.post.findFirst({
        where: {
          id: postId,
        },
      });

      if (post.author_id !== req.user.id) {
        return res.status(401).json({ message: "Failed scrutiny." });
      }

      const { content } = req.body;
      const img_url = req.file?.path ?? null;

      console.log(img_url);
      if (img_url === null) {
        await prisma.post.update({
          where: {
            id: postId,
          },
          data: {
            content,
          },
        });
      } else {
        await prisma.post.update({
          where: {
            id: postId,
          },
          data: {
            content,
            img_url,
          },
        });
      }

      return res.json({ message: "Post updated successfully", postId });
    } catch (err) {
      return res.status(404).json({ err, message: "something went wrong" });
    }
  })
  .delete(async (req, res) => {
    try {
      const { postId } = req.params;

      const post = await prisma.post.findFirst({
        where: {
          id: postId,
        },
      });

      if (!post || post.author_id !== req.user.id) {
        return res.status(401).json({ message: "Scrutiny failed" });
      }

      await prisma.post.delete({
        where: {
          id: postId,
        },
      });

      return res.json({ message: "Post delete successfully!" });
    } catch (err) {}
  });

// comments
//  get all comments
router.get("/posts/:postId/comments", async (req, res) => {
  try {
    // todo
    const { postId } = req.params;
    const comments = await prisma.comment.findMany({
      where: {
        post_id: postId,
      },
      include: {
        author: {
          select: {
            name: true,
            profileImage: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!comments) {
      return res.status(404);
    }

    console.log(comments);
    return res.json(comments);
  } catch (err) {
    return res.json({ err });
  }
});

router
  .route("/posts/:postId/comment")
  .post(async (req, res) => {
    try {
      const { content } = req.body;
      const { postId } = req.params;
      const newComment = await prisma.comment.create({
        data: {
          author_id: req.user.id,
          post_id: postId,
          content,
        },
      });

      const comment = await prisma.comment.findFirst({
        where: {
          id: newComment.id,
        },
        include: {
          author: {
            select: {
              name: true,
              profileImage: true,
            },
          },
        },
      });

      // todo: new a new comment obj with name and profileImage

      return res.json({
        message: "Commented successfully!",
        comment,
      });
    } catch (err) {
      return res.status(500).json(err);
    }
  })
  .put(async (req, res) => {
    try {
      const { content, commentId } = req.body;

      const comment = await prisma.comment.findFirst({
        where: {
          id: commentId,
        },
      });

      if (!commentId || !comment) {
        return res.sendStatus(404);
      }

      if (comment.author_id !== req.user.id) {
        return res.json(401).send("Scrutiny failed");
      }

      await prisma.comment.update({
        where: {
          id: commentId,
        },
        data: {
          content,
        },
      });

      return res.send("Comment updated!");
    } catch (err) {
      return res.status(500).json(err);
    }
  })
  .delete(async (req, res) => {
    try {
      const { commentId } = req.body;
      console.log(commentId);

      const comment = await prisma.comment.findFirst({
        where: {
          id: commentId,
        },
      });

      if (!commentId || !comment) {
        return res.sendStatus(404);
      }

      if (comment.author_id !== req.user.id) {
        return res.status(401).send("Scrutiny falied");
      }

      await prisma.comment.delete({
        where: {
          id: commentId,
        },
      });

      return res.send("Comment deleted!");
    } catch (err) {
      return res.status(500).json(err);
    }
  });

// like on posts
router
  .route("/posts/:postId/like")
  .post(async (req, res) => {
    const { postId } = req.params;

    try {
      const alreadyLike = await prisma.like.findFirst({
        where: {
          author_id: req.user.id,
          post_id: postId,
        },
      });

      if (alreadyLike) {
        return res.json({ message: "Already liked" });
      }
      const like = await prisma.like.create({
        data: {
          author_id: req.user.id,
          post_id: postId,
        },
      });

      if (!like) {
        return res.status(404).send("Failed to Like the post");
      }

      return res.json({ message: "Post Liked!" });
    } catch (err) {
      return res.status(500).json(err);
    }
  })
  .delete(async (req, res) => {
    try {
      const { postId } = req.params;

      await prisma.like.deleteMany({
        where: {
          post_id: postId,
          author_id: req.user.id,
        },
      });

      return res.json({ message: "Like delete Successfully!" });
    } catch (err) {
      return res.status(500).json(err);
    }
  })
  .get(async (req, res) => {
    try {
      const { postId } = req.params;

      const likeCount = await prisma.like.count({
        where: {
          post_id: postId,
        },
      });

      return res.json(likeCount);
    } catch (err) {
      return res.status(500).json(err);
    }
  });

// get all the users who are not followers or following of the current use
router.get(
  "/people",
  asyncHandler(async (req, res) => {
    try {
      // todo
      const followers = await prisma.following.findMany({
        where: {
          following_id: req.user.id,
        },
        select: {
          follower_id: true,
        },
      });

      const followings = await prisma.following.findMany({
        where: {
          follower_id: req.user.id,
        },
        select: {
          following_id: true,
        },
      });

      const requested = await prisma.followingRequest.findMany({
        where: {
          requester_id: req.user.id,
        },
      });

      const guestUsers = await prisma.user.findMany({
        where: {
          username: {
            startsWith: "guest_",
          },
        },
      });

      const followersArray = followers.map((f) => f.follower_id);
      const followingsArray = followings.map((f) => f.following_id);
      const guestUserArray = guestUsers.map((g) => g.id);
      const requestArray = requested.map((r) => r.requestee_id);
      let arr = followersArray.concat(followingsArray);
      arr = arr.concat(requestArray);
      arr = arr.concat(guestUserArray);

      // find people other then follower, following, and self
      const peoples = await prisma.user.findMany({
        where: {
          id: {
            notIn: [...arr, req.user.id],
          },
        },
        select: {
          name: true,
          username: true,
          name: true,
          id: true,
          profileImage: true,
        },
      });

      return res.json({ peoples });
    } catch (err) {
      console.error("dbError: ", err);
      return res.json({ err });
    }
  })
);

router.get(
  "/people/:userId",
  asyncHandler(async (req, res) => {
    try {
      // todo
      const { userId } = req.params;
      const profile = await prisma.user.findFirst({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          profileImage: true,
          username: true,
          bio: true,
          _count: {
            select: {
              followers: true,
              followings: true,
            },
          },
        },
      });

      if (!profile) {
        return res.status(404).json({ message: "No user with that username" });
      }

      // const followers = await prisma.following.findMany({
      //   where: {
      //     following_id: profile.id,
      //   },
      //   select: {
      //     follower_id: true,
      //   },
      // });

      // const followings = await prisma.following.findMany({
      //   where: {
      //     follower_id: profile.id,
      //   },
      //   select: {
      //     following_id: true,
      //   },
      // });

      const isFollowing = await prisma.following.findFirst({
        where: {
          OR: [
            {
              follower_id: profile.id,
              following_id: req.user.id,
            },
            {
              follower_id: req.user.id,
              following_id: profile.id,
            },
          ],
        },
      });

      console.log(isFollowing);
      if (isFollowing) {
        const posts = await prisma.post.findMany({
          where: {
            author_id: profile.id,
          },
          include: {
            author: {
              select: {
                name: true,
                profileImage: true,
                username: true,
              },
            },
            likes: {
              select: {
                author_id: true,
              },
            },
            _count: {
              select: {
                likes: true,
                comments: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc", // sorting by newest posts
          },
        });

        return res.json({ profile, posts });
      }

      return res.json({ profile });
    } catch (err) {
      console.error("dbError", err);
      return res.json({ err });
    }
  })
);

// get all the following and followers
router.get(
  "/connections",
  asyncHandler(async (req, res) => {
    try {
      // todo
      const followers = await prisma.following.findMany({
        where: {
          following_id: req.user.id,
        },
        select: {
          id: true,
          follower: {
            select: {
              id: true,
              profileImage: true,
              name: true,
            },
          },
        },
      });

      const followings = await prisma.following.findMany({
        where: {
          follower_id: req.user.id,
        },
        select: {
          id: true,
          following: {
            select: {
              id: true,
              profileImage: true,
              name: true,
            },
          },
        },
      });

      return res.json({ followers, followings });
    } catch (dbError) {
      console.log(dbError);
      return res.json({ dbError });
    }
  })
);

router.post(
  "/following/check",
  asyncHandler(async (req, res) => {
    try {
      // todo
      const id = req.body.followingId;

      // check if req.user does follows the userId requested
      const isFollowing = await prisma.following.findFirst({
        where: {
          follower_id: id,
          following_id: req.user.id,
        },
      });

      const isFollowed = await prisma.following.findFirst({
        where: {
          follower_id: req.user.id,
          following_id: id,
        },
      });

      const isRequested = await prisma.followingRequest.findFirst({
        where: {
          requester_id: req.user.id,
          requestee_id: id,
        },
      });

      console.log("request", isRequested);

      if (isFollowed) {
        return res.json({ isFollowed: true });
      }
      if (isFollowing) {
        return res.json({ isFollowing: true });
      } else {
        if (isRequested) {
          return res.json({ isFollowing: false, isRequested: true });
        } else {
          return res.json({ isFollowing: false, isRequested: false });
        }
      }
    } catch (err) {
      return res.json({ success: false });
    }
  })
);

router.delete("/following/:followingUserId", async (req, res) => {
  try {
    // todo
    const { followingUserId } = req.params;
    const following = await prisma.following.findFirst({
      where: {
        follower_id: req.user.id,
        following_id: followingUserId,
      },
    });

    if (following) {
      await prisma.following.delete({
        where: {
          id: following.id,
        },
      });

      return res.json({ deleted: true });
    }
    return res.json({ deleted: false });
  } catch (err) {
    return res.status(404).json({ err });
  }
});

router.get("/following/requests", async (req, res) => {
  try {
    const requests = await prisma.followingRequest.findMany({
      where: {
        requestee_id: req.user.id,
      },
      select: {
        id: true,
        requester_id: true,
        requester: {
          select: {
            name: true,
            username: true,
          },
        },
      },
    });

    return res.json(requests);
  } catch (err) {
    return res.json(err);
  }
});

router.post("/following/accept/:requestId", async (req, res) => {
  try {
    const { requestId } = req.params;

    // Check if the request is valid
    const isValidRequest = await prisma.followingRequest.findFirst({
      where: {
        id: requestId,
      },
    });

    console.log("valid request", isValidRequest);

    if (!isValidRequest) {
      return res.status(404).json({ error: "Invalid Request" }); // 404 for not found
    }

    // Create new following relationship
    const newFollowing = await prisma.following.create({
      data: {
        follower_id: isValidRequest.requester_id, // Corrected typo
        following_id: isValidRequest.requestee_id,
      },
    });

    console.log(newFollowing);

    // Update the follow request status to accepted
    await prisma.followingRequest.delete({
      where: {
        id: requestId,
      },
    });

    return res.json({ message: "Followed successfully!" });
  } catch (err) {
    console.error(err); // Log the error for debugging
    return res.status(500).json({ error: "Internal server error" }); // Use 500 for server errors
  }
});

router.delete("/following/decline/:requestId", async (req, res) => {
  try {
    const { requestId } = req.params;

    const decline = await prisma.followingRequest.delete({
      where: {
        id: requestId,
      },
    });

    console.log(decline);

    return res.json({ message: "Declined successfully!", deleted: true });
  } catch (err) {
    return res.json(err);
  }
});

router.post(
  "/followingRequest/:userId",
  asyncHandler(async (req, res) => {
    console.log("inside following request");
    try {
      const { userId } = req.params;
      // create a following request;
      const request = await prisma.followingRequest.create({
        data: {
          requester_id: req.user.id,
          requestee_id: userId,
        },
      });

      if (!request) {
        return res.json({ request: false });
      }

      return res.json({ requested: true });
    } catch (err) {
      return res.json(err);
    }
  })
);

router.delete(
  "/followingRequest/:userId",
  asyncHandler(async (req, res) => {
    try {
      const { userId } = req.params;
      // create a following request;
      const deleted = await prisma.followingRequest.deleteMany({
        where: {
          requester_id: req.user.id,
          requestee_id: userId,
        },
      });

      console.log(deleted);
      if (!deleted) {
        return res.json({ deleted: false });
      }

      return res.json({ deleted: true });
    } catch (err) {
      return res.json(err);
    }
  })
);

// chat
router.get("/chat/:recipientId", async (req, res) => {
  try {
    const { recipientId } = req.params;

    // Fetch messages between the current user and the recipient
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          {
            sender_id: req.user.id, // Messages sent by the current user
            receiver_id: recipientId, // Messages received by the recipient
          },
          {
            sender_id: recipientId, // Messages sent by the recipient
            receiver_id: req.user.id, // Messages received by the current user
          },
        ],
      },
      orderBy: {
        createdAt: "asc", // Optional: Order messages by creation time
      },
    });

    const isConnected = await prisma.following.findFirst({
      where: {
        OR: [
          {
            follower_id: req.user.id,
            following_id: recipientId,
          },
          {
            follower_id: recipientId,
            following_id: req.user.id,
          },
        ],
      },
    });

    if (isConnected) {
      const receiver = await prisma.user.findFirst({
        where: {
          id: recipientId,
        },
        select: {
          id: true,
          name: true,
          username: true,
        },
      });
      return res.json({ messages, receiver });
    }

    return res.sendStatus(404);
  } catch (err) {
    console.error(err); // Log the error for debugging
    return res
      .status(500)
      .json({ error: "An error occurred while fetching messages." });
  }
});

router.get("/conversations", async (req, res) => {
  try {
    const userId = req.user.id;
    // todo bring all the instances to unique messasges;
    const conversations = await prisma.message.findMany({
      where: {
        OR: [{ sender_id: userId }, { receiver_id: userId }],
      },
      select: {
        sender: {
          select: {
            id: true,
            name: true,
            profileImage: true,
            username: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            profileImage: true,
            username: true,
          },
        },
      },
    });

    const uniqueConversations = [];
    const seen = new Set();

    conversations.forEach(({ sender, receiver }) => {
      const partner = sender.id === userId ? receiver : sender;
      if (!seen.has(partner.id)) {
        seen.add(partner.id);
        uniqueConversations.push(partner);
      }
    });

    return res.json({ conversations: uniqueConversations });
  } catch (err) {
    return res.json({ err });
  }
});

export default router;
