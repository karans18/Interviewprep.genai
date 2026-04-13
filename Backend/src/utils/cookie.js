// const TOKEN_COOKIE_NAME = "token"
// const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000

// function isProductionEnvironment() {
//     return process.env.NODE_ENV === "production"
// }

// function getTokenCookieOptions() {
//     const isProduction = isProductionEnvironment()

//     return {
//         httpOnly: true,
//         secure: isProduction,
//         sameSite: isProduction ? "none" : "lax",
//         maxAge: ONE_DAY_IN_MS,
//         path: "/"
//     }
// }

// function getClearTokenCookieOptions() {
//     const { maxAge, ...cookieOptions } = getTokenCookieOptions()

//     return cookieOptions
// }

// module.exports = {
//     TOKEN_COOKIE_NAME,
//     getTokenCookieOptions,
//     getClearTokenCookieOptions
// }
const TOKEN_COOKIE_NAME = "token";
const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;

function isProductionEnvironment() {
  return process.env.NODE_ENV === "production";
}

function getTokenCookieOptions() {
  const isProduction = isProductionEnvironment();

  return {
    httpOnly: true,
    secure: isProduction, // required for HTTPS (Render)
    sameSite: isProduction ? "None" : "Lax", // 🔥 FIXED (capital N)
    maxAge: ONE_DAY_IN_MS,
    path: "/",
  };
}

function getClearTokenCookieOptions() {
  const isProduction = isProductionEnvironment();

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "None" : "Lax",
    path: "/",
  };
}

module.exports = {
  TOKEN_COOKIE_NAME,
  getTokenCookieOptions,
  getClearTokenCookieOptions,
};
