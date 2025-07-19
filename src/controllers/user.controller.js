import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { uploadFile } from "../utils/cloudinary.js";

const generateAccessAndRefreshToken = async (user_id) => {
  try {
    const user = await User.findById(user_id);

    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();
    console.log(refreshToken);
    console.log(accessToken);

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { refreshToken, accessToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while creating the access and refresh token"
    );
  }
};

//controllers
const registerUser = asyncHandler(async (req, res) => {
  //get user details from user
  //validation - not empty
  //check if user exists - username/email
  //check for images - avatar
  //upload them to cloudinary
  //create entry in db
  //remove password and refreshToken from response
  //check if user got created in db - return response

  //get user details from user
  const { username, email, fullName, password } = req.body;
  //   console.log(email, fullName)

  //validation - not empty
  if (
    [username, email, fullName, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  //check if user exists - username/email
  const existingUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existingUser) {
    throw new ApiError(409, "User with email or username already exists");
  }

  //check for images - avatar
  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

  //   console.log(avatarLocalPath)

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }
  // console.log(req.files)

  //upload to cloudinary
  const avatar = await uploadFile(avatarLocalPath);
  const coverImage = await uploadFile(coverImageLocalPath);

  console.log(avatar);

  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
  }

  //create entry in db
  const user = await User.create({
    fullName: fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email: email,
    password: password,
    username: username.toLowerCase(),
  });

  //check if user got created in db + remove password and refreshToken field

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  //return response
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registration succesfull"));
});

const loginUser = asyncHandler(async (req, res) => {
  //read data from req.body
  //check if username / email exists
  // password check
  // creation of access and refresh token
  // send tokens via cookies
  // successful login response

  const { username, email, password } = req.body;

  if (!(username || email)) {
    throw new ApiError(400, "username or email is required");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "User does not exist"); //add error status code and message
  }

  //   console.log(user.isPasswordCorrect(password));
  const isPasswordCorrect = await user.isPasswordCorrect(password);
  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid user credentials");
  }

  const { refreshToken, accessToken } = await generateAccessAndRefreshToken(
    user._id
  );

  console.log(refreshToken);
  console.log(accessToken);
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("refreshToken", refreshToken, options)
    .cookie("accessToken", accessToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken: accessToken,
          refreshToken: refreshToken,
        },
        "Succesfully logged in"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  const user = User.findByIdAndUpdate(req.user._id, {
    $set: {
      requestToken: undefined,
    },
  });

  const options = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .clearCookie("refreshToken", options)
    .clearCookie("accessToken", options)
    .json(new ApiResponse(200, {}, "Logged out succesfully"));
});

export { registerUser, loginUser, logoutUser };
