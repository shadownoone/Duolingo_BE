const GoogleStrategy = require("passport-google-oauth20").Strategy;

const LocalStrategy = require("passport-local").Strategy;

// const FacebookStrategy = require('passport-facebook').Strategy;

const passport = require("passport");
const jwtService = require("~/services/jwtService");

const db = require("~/models");
const authService = require("~/services/authService");

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email, password, done) => {
      const result = await authService.handleLogin({ email, password });

      if (result.code === 0) {
        // Đăng nhập thành công
        return done(null, result.data); // 'data' là thông tin user
      } else {
        // Sai mật khẩu hoặc user không tồn tại
        return done(null, false, { message: result.message });
      }
    }
  )
);

function generateRandomPassword(length = 10) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

// Google
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: "/api/v1/auth/google/callback",
      scope: ["profile", "email"],
    },
    async function (accessToken, refreshToken, profile, callback) {
      try {
        // Kiểm tra xem người dùng đã tồn tại chưa
        const existingUser = await db.User.findOne({
          where: { email: profile.emails[0].value },
        });

        if (existingUser) {
          // Nếu người dùng đã tồn tại, tạo token cho người dùng hiện tại
          existingUser.accessToken = jwtService.generateToken({
            id: existingUser.id,
            email: existingUser.email,
          });

          // Trả về người dùng hiện tại
          return callback(null, existingUser);
        }

        // Nếu người dùng chưa tồn tại, tạo người dùng mới
        const newUser = await db.User.create({
          username: profile.displayName,
          email: profile.emails[0].value,
          avatar: profile.photos[0].value,
          password: generateRandomPassword(),
        });

        // Tạo token cho người dùng mới
        newUser.accessToken = jwtService.generateToken({
          id: newUser.id,
          email: newUser.email,
        });

        return callback(null, newUser);
      } catch (error) {
        console.error("Error authenticating with Google:", error);
        return callback(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// Facebook
// passport.use(
//     new FacebookStrategy(
//         {
//             clientID: process.env.FACEBOOK_APP_ID,
//             clientSecret: process.env.FACEBOOK_APP_SECRET,
//             callbackURL:
//                 'https://bd4b-2001-ee0-4903-9290-71e3-7ca3-d474-75d8.ngrok-free.app/api/v1/auth/facebook/callback',
//             profileFields: ['id', 'displayName', 'photos', 'email'],
//         },
//         async function (accessToken, refreshToken, profile, callback) {
//             try {
//                 console.log(profile);
//
//                 // Tìm kiếm hoặc tạo người dùng trong cơ sở dữ liệu
//                 const [user, created] = await db.User.findOrCreate({
//                     where: {
//                         username: profile.displayName,
//                         email: profile.emails ? profile.emails[0].value : `${profile.id}@facebook.com`,
//                         avatar: profile.photos ? profile.photos[0].value : null,
//                     },
//                 });
//
//                 if (user) {
//                     user.accessToken = jwtService.generateToken({
//                         id: user.id,
//                         email: user.email,
//                     });
//
//                     return callback(null, user);
//                 }
//             } catch (error) {
//                 console.error('Error during Facebook authentication:', error);
//                 return callback(error, null);
//             }
//         },
//     ),
// );
