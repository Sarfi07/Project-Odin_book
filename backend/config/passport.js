import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { Strategy as GithubStrategy } from "passport-github2";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import prisma from "../utils/prismaClient.js";
import bcrypt from "bcrypt";

passport.use(
  new LocalStrategy(
    {
      usernameField: "username",
      passwordField: "password",
    },
    async (username, password, done) => {
      console.log("Starting authentication for user:", username);
      try {
        const user = await prisma.user.findFirst({
          where: { username },
        });

        if (!user) {
          console.log("User not found");
          return done(null, false, { message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
          console.log("Password mismatch");
          return done(null, false, { message: "Invalid credentials" });
        }

        console.log("User authenticated successfully");
        return done(null, user); // User authenticated
      } catch (err) {
        console.error("Error during authentication:", err);
        return done(err); // Error case
      }
    }
  )
);

// jwt
const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.SECRET_KEY,
};

passport.use(
  new JwtStrategy(opts, async (jwt_payload, done) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: jwt_payload.id },
      });

      if (user) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    } catch (err) {
      console.error("Error during Jwt authentication:", err);
      return done(err, false);
    }
  })
);

// github OAuth
const G_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const G_SECRET = process.env.GITHUB_CLIENT_SECRET;
const CB_URL = process.env.CALLBACK_URL;
passport.use(
  new GithubStrategy(
    {
      clientID: G_CLIENT_ID,
      clientSecret: G_SECRET,
      callbackURL: CB_URL,
    },

    async (accessToken, refreshToken, profile, done) => {
      try {
        const profileDecoded = profile._json;
        const user = await prisma.user.upsert({
          where: { gitHubId: profile.id },
          update: {
            name: profileDecoded.name,
            username: profileDecoded.login,
            profileImage: profileDecoded.avatar_url,
          },
          create: {
            gitHubId: profile.id,
            name: profileDecoded.name,
            username: profileDecoded.login,
            profileImage: profileDecoded.avatar_url,
          },
        });

        return done(null, user);
      } catch (err) {
        console.error("Error during github OAuth: ", err);
        return done(err);
      }
    }
  )
);

// google OAuth
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_CB_URL = process.env.GOOGLE_CALLBACK_URL;

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_SECRET,
      callbackURL: GOOGLE_CB_URL,
    },

    async (accessToken, refreshToken, profile, done) => {
      try {
        // todo
        const user = await prisma.user.upsert({
          where: { googleId: profile.id },
          update: {
            name: profile.displayName,
            username: profile.emails[0].value,
            profileImage: profile.photos[0].value,
          },
          create: {
            googleId: profile.id,
            name: profile.displayName,
            username: profile.id,
            profileImage: profile.photos[0].value,
          },
        });

        return done(null, user);
      } catch (err) {
        console.error("Error during Google OAuth: ", err);
        return done(err);
      }
    }
  )
);

export default passport;
